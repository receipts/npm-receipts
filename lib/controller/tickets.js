'use strict';

var async = require('async');
var options = require('config');
var moment = require('moment');
var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var receiptsEnum = require('receipts-model').enum;
var Currency = receiptsEnum.Currency;
var receiptsModel = require('receipts-model').model;
var TicketResponseBuilder = receiptsModel.ticketResponse.TicketResponseBuilder;
var LotteryTicketsCollectionResponseBuilder = receiptsModel.lotteryTicketsCollectionResponse.LotteryTicketsCollectionResponseBuilder;
var AmountResponseBuilder = receiptsModel.amountResponse.AmountResponseBuilder;
var BadRequestError = myRestifyApi.error.BadRequestError;
var ForbiddenError = myRestifyApi.error.ForbiddenError;
var keen = require('../keen');
var receipts = require('../receipts');
var validator = require('../validator/validator');

var parseUserAuth = function parseUserAuth(string, next) {
  var decoded;
  var index;
  var pieces;

  decoded = (new Buffer(string, 'base64')).toString('utf8');
  if (!decoded) {
    return next(new ForbiddenError('UserAuth header invalid'));
  }

  index = decoded.indexOf(':');
  if (index === -1) {
    pieces = [decoded];
  }
  else {
    pieces = [decoded.slice(0, index), decoded.slice(index + 1)];
  }

  if (!pieces || typeof pieces[0] !== 'string') {
    return next(new ForbiddenError('UserAuth header invalid'));
  }

  return {
    username: pieces[0],
    password: pieces[1]
  };
};

var buildResponse = function buildResponse(receipt, callback) {

  var amount = new AmountResponseBuilder()
    .withCurrency(Currency.PLN)
    .withValue(receipt.amountValue)
    .build();

  return callback(null, new TicketResponseBuilder()
    .withId(receipt.id)
    .withCode(receipt.code)
    .withPurchaseOrderNumber(receipt.purchaseOrderNumber)
    .withAmount(amount)
    .withDate(receipt.date)
    .build());
};

var getLotteryTicketsCollectionV1 = function getLotteryTicketsCollectionV1(req, res, next) {
  try {
    assert.string(req.header('UserAuth'), 'UserAuth header');
  }
  catch (e) {
    return next(new ForbiddenError(e.message));
  }

  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.optionalString(req.params.limit, 'limit');
    assert.optionalString(req.params.offset, 'offset');
    assert.optionalString(req.params.sort, 'sort');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;
  //var limit = req.params.limit;
  //var offset = req.params.offset;
  //var sort = req.params.sort;

  var userAuth = parseUserAuth(req.header('UserAuth'), next);

  var authRequest = {
    email: userAuth.username,
    password: userAuth.password
  };

  receipts.getLotteryTicketsCollection(id, authRequest, options, function (err, data) {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    async.map(data, buildResponse, function (asyncErr, tickets) {

      next.ifError(asyncErr);

      //tickets TODO limit and offset

      var collection = new LotteryTicketsCollectionResponseBuilder()
        .withTotal(tickets.length)
        .withTickets(tickets)
        .build();

      res.send(200, collection);
      next();

      return keen.getTicketsCollection(req.authorization.bearer, req.params);
    });
  });
};

var createLotteryTicketV1 = function createLotteryTicketV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.string(req.params.pointOfSale, 'pointOfSale');
    assert.string(req.params.purchaseOrderNumber, 'purchaseOrderNumber');
    assert.object(req.params.amount, 'amount');
    assert.string(req.params.amount.currency, 'amount.currency');
    assert.string(req.params.amount.value, 'amount.value');
    assert.string(req.params.date, 'date');
    assert.string(req.params.taxRegistrationNumber, 'taxRegistrationNumber');
    assert.string(req.params.phone, 'phone');
    assert.string(req.params.trade, 'trade');
    assert.string(req.params.email, 'email');
    assert.object(req.params.agreements, 'agreements');
    assert.bool(req.params.agreements.termsOfService, 'agreements.termsOfService');
    assert.bool(req.params.agreements.personalDataProcessing, 'agreements.personalDataProcessing');
    assert.bool(req.params.agreements.useMyEffigy, 'agreements.useMyEffigy');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  validator.validateAmount(req.params.amount, next);
  req.params.amount.value = req.params.amount.value.replace(',', '.');
  validator.validateDate(req.params.date, next);
  validator.validateEmail(req.params.email, next);
  req.params.phone = validator.validatePhone(req.params.phone, next);
  validator.validatePointOfSale(req.params.pointOfSale, next);
  validator.validateTaxRegistrationNumber(req.params.taxRegistrationNumber, next);
  validator.validatePurchaseOrderNumber(req.params.purchaseOrderNumber, next);
  validator.validateTrade(req.params.trade, next);


  var lotteryId = req.params.id;
  var ticketRequest = req.params;

  receipts.createLotteryTicket(lotteryId, ticketRequest, options, function (err, data) {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    var amount = new AmountResponseBuilder()
      .withCurrency(Currency.PLN)
      .withValue(ticketRequest.amount.value)
      .build();

    var response = new TicketResponseBuilder()
      .withId(data.id)
      .withCode(data.code)
      .withPurchaseOrderNumber(ticketRequest.purchaseOrderNumber)
      .withAmount(amount)
      .withDate(moment(ticketRequest.date).toISOString())
      .build();

    res.send(201, response);
    next();

    var keenData = {
      tax: req.params.taxRegistrationNumber,
      pos: req.params.pointOfSale
    };

    return keen.createLotteryTicket(req.authorization.bearer, keenData);
  });
};

module.exports = {
  getLotteryTicketsCollectionV1: getLotteryTicketsCollectionV1,
  createLotteryTicketV1: createLotteryTicketV1
};
