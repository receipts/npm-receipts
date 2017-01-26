'use strict';

const logger = require('../logger/logger').logger;
const async = require('async');
const options = require('config');
const moment = require('moment');
const assert = require('assert-plus');
const myRestifyApi = require('my-restify-api');
const receiptsEnum = require('receipts-model').enum;
const Currency = receiptsEnum.Currency;
const receiptsModel = require('receipts-model').model;
const TicketDetailsResponseBuilder = receiptsModel.ticketDetailsResponse.TicketDetailsResponseBuilder;
const TicketResponseBuilder = receiptsModel.ticketResponse.TicketResponseBuilder;
const LotteryTicketsCollectionResponseBuilder = receiptsModel.lotteryTicketsCollectionResponse.LotteryTicketsCollectionResponseBuilder;
const AmountResponseBuilder = receiptsModel.amountResponse.AmountResponseBuilder;
const BadRequestError = myRestifyApi.error.BadRequestError;
const ForbiddenError = myRestifyApi.error.ForbiddenError;
const keen = require('../keen');
const receipts = require('../receipts');
const validator = require('../validator/validator');

const parseUserAuth = function parseUserAuth(string, next) {
  let decoded;
  let index;
  let pieces;

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

const buildTicketResponse = function buildTicketResponse(ticket, callback) {

  const amount = new AmountResponseBuilder()
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

const buildTicketDetailsResponse = function buildTicketDetailsResponse(ticket, callback) {

  const amount = new AmountResponseBuilder()
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

const removeDuplicates = function removeDuplicates(data) {
  const uniqCodes = {};
  return data
    .filter(({code}) => {
      if (uniqCodes.hasOwnProperty(code)) {
        logger.debug(`Founded duplicate code: ${code}`);
        return false;
      }

      uniqCodes[code] = true;
      return true;
    });
};

const getLotteryTicketsCollectionV1 = function getLotteryTicketsCollectionV1(req, res, next) {
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

  const id = req.params.id;

  const userAuth = parseUserAuth(req.header('UserAuth'), next);

  const authRequest = {
    email: userAuth.username,
    password: userAuth.password
  };

  return receipts.getLotteryTicketsCollection(id, authRequest, options, (err, data) => {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    const uniqData = removeDuplicates(data);

    return async.map(uniqData, buildTicketResponse, (asyncErr, tickets) => {

      next.ifError(asyncErr);

      const collection = new LotteryTicketsCollectionResponseBuilder()
        .withTotal(tickets.length)
        .withTickets(tickets)
        .build();

      res.send(200, collection);
      next();

      return keen.getTicketsCollection(req.authorization.bearer, req.params);
    });
  });
};

const createLotteryTicketV1 = function createLotteryTicketV1(req, res, next) {
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


  const lotteryId = req.params.id;
  const ticketRequest = req.params;

  return receipts.createLotteryTicket(lotteryId, ticketRequest, options, (err, {id, code}) => {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    const amount = new AmountResponseBuilder()
      .withCurrency(Currency.PLN)
      .withValue(ticketRequest.amount.value)
      .build();

    const response = new TicketResponseBuilder()
      .withId(id)
      .withCode(code)
      .withPurchaseOrderNumber(ticketRequest.purchaseOrderNumber)
      .withAmount(amount)
      .withDate(moment(ticketRequest.date).toISOString())
      .build();

    res.send(201, response);
    next();

    const keenData = {
      tax: req.params.taxRegistrationNumber,
      pos: req.params.pointOfSale
    };

    return keen.createLotteryTicket(req.authorization.bearer, keenData);
  });
};

const getLotteryTicketV1 = function getLotteryTicketV1(req, res, next) {
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

  const id = req.params.id;
  const ticketId = req.params.ticketId;
  const userAuth = parseUserAuth(req.header('UserAuth'), next);

  const authRequest = {
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

const updateLotteryTicketV1 = function updateLotteryTicketV1(req, res, next) {
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

  const lotteryId = req.params.id;
  const ticketId = req.params.ticketId;
  const updateTicketRequest = req.params;
  const userAuth = parseUserAuth(req.header('UserAuth'), next);

  const authRequest = {
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

      const keenData = {
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
