'use strict';

var logger = require('../logger/logger').logger;
var async = require('async');
var options = require('config');
var moment = require('moment');
var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var receiptsEnum = require('receipts-model').enum;
var Currency = receiptsEnum.Currency;
var receiptsModel = require('receipts-model').model;
var TicketDetailsResponseBuilder = receiptsModel.ticketDetailsResponse.TicketDetailsResponseBuilder;
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

var buildTicketResponse = function buildTicketResponse(ticket, callback) {

  var amount = new AmountResponseBuilder()
    .withCurrency(Currency.PLN)
    .withValue(ticket.amountValue)
    .build();

  return callback(null, new TicketResponseBuilder()
    .withId(ticket.id)
    .withCode(ticket.code)
    .withPurchaseOrderNumber(ticket.purchaseOrderNumber)
    .withAmount(amount)
    .withDate(ticket.date)
    .withSpecial(ticket.special)
    .build());
};

var buildTicketDetailsResponse = function buildTicketDetailsResponse(ticket, callback) {

  var amount = new AmountResponseBuilder()
    .withCurrency(ticket.amount.currency)
    .withValue(ticket.amount.value)
    .build();

  return callback(null, new TicketDetailsResponseBuilder()
    .withId(ticket.id)
    .withCode(ticket.code)
    .withPurchaseOrderNumber(ticket.purchaseOrderNumber)
    .withAmount(amount)
    .withDate(ticket.date)
    .withSpecial(ticket.special)
    .withPointOfSale(ticket.pointOfSale)
    .withTaxRegistrationNumber(ticket.taxRegistrationNumber)
    .withTrade(ticket.trade)
    .build());
};

var removeDuplicates = function removeDuplicates(data) {
  var uniqCodes = {};
  return data
    .filter(ticket => {
      if (uniqCodes.hasOwnProperty(ticket.code)) {
        logger.debug('Founded duplicate code: %s', ticket.code);
        return false;
      }

      uniqCodes[ticket.code] = true;
      return true;
    });
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
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;

  var userAuth = parseUserAuth(req.header('UserAuth'), next);

  var authRequest = {
    email: userAuth.username,
    password: userAuth.password
  };

  return receipts.getLotteryTicketsCollection(id, authRequest, options, (err, data) => {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    var uniqData = removeDuplicates(data);

    return async.map(uniqData, buildTicketResponse, (asyncErr, tickets) => {

      next.ifError(asyncErr);

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

  return receipts.createLotteryTicket(lotteryId, ticketRequest, options, (err, data) => {
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

var getLotteryTicketV1 = function getLotteryTicketV1(req, res, next) {
  try {
    assert.string(req.header('UserAuth'), 'UserAuth header');
  }
  catch (e) {
    return next(new ForbiddenError(e.message));
  }

  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.string(req.params.ticketId, 'ticketId');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;
  var ticketId = req.params.ticketId;
  var userAuth = parseUserAuth(req.header('UserAuth'), next);

  var authRequest = {
    email: userAuth.username,
    password: userAuth.password
  };

  return receipts.getLotteryTicket(id, ticketId, authRequest, options, (err, data) => {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    return buildTicketDetailsResponse(data, (buildErr, ticket) => {
      next.ifError(buildErr);

      res.send(200, ticket);
      next();

      return keen.getTicket(req.authorization.bearer, req.params);
    });
  });
};

var updateLotteryTicketV1 = function updateLotteryTicketV1(req, res, next) {
  try {
    assert.string(req.header('UserAuth'), 'UserAuth header');
  }
  catch (e) {
    return next(new ForbiddenError(e.message));
  }

  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.string(req.params.ticketId, 'ticketId');
    assert.string(req.params.pointOfSale, 'pointOfSale');
    assert.string(req.params.purchaseOrderNumber, 'purchaseOrderNumber');
    assert.object(req.params.amount, 'amount');
    assert.string(req.params.amount.currency, 'amount.currency');
    assert.string(req.params.amount.value, 'amount.value');
    assert.string(req.params.date, 'date');
    assert.string(req.params.taxRegistrationNumber, 'taxRegistrationNumber');
    assert.string(req.params.trade, 'trade');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  validator.validateAmount(req.params.amount, next);
  req.params.amount.value = req.params.amount.value.replace(',', '.');
  validator.validateDate(req.params.date, next);
  validator.validatePointOfSale(req.params.pointOfSale, next);
  validator.validateTaxRegistrationNumber(req.params.taxRegistrationNumber, next);
  validator.validatePurchaseOrderNumber(req.params.purchaseOrderNumber, next);
  validator.validateTrade(req.params.trade, next);

  var lotteryId = req.params.id;
  var ticketId = req.params.ticketId;
  var updateTicketRequest = req.params;
  var userAuth = parseUserAuth(req.header('UserAuth'), next);

  var authRequest = {
    email: userAuth.username,
    password: userAuth.password
  };

  return receipts.updateLotteryTicket(lotteryId, ticketId, authRequest, updateTicketRequest, options, (err, data) => {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    return buildTicketDetailsResponse(data, (buildErr, ticket) => {
      next.ifError(buildErr);

      res.send(200, ticket);
      next();

      var keenData = {
        tax: req.params.taxRegistrationNumber,
        pos: req.params.pointOfSale
      };

      return keen.updateTicket(req.authorization.bearer, keenData);
    });
  });
};

module.exports = {
  getLotteryTicketsCollectionV1: getLotteryTicketsCollectionV1,
  createLotteryTicketV1: createLotteryTicketV1,
  getLotteryTicketV1: getLotteryTicketV1,
  updateLotteryTicketV1: updateLotteryTicketV1
};
