'use strict';

var meta = require('./meta');
var results = require('./results');
var logger = require('./logger/logger').logger;
var receiptsLotteryClient = require('receipts-lottery-client');
var receiptsModel = require('receipts-model').model;
var receiptsEnum = require('receipts-model').enum;
var TradeResponseBuilder = receiptsModel.tradeResponse.TradeResponseBuilder;
var LotteryTradesCollectionResponseBuilder = receiptsModel.lotteryTradesCollectionResponse.LotteryTradesCollectionResponseBuilder;
var LotteryResultsCollectionResponseBuilder = receiptsModel.lotteryResultsCollectionResponse.LotteryResultsCollectionResponseBuilder;
var Trade = receiptsEnum.Trade;

var getLotteryTicketsCollection = function getLotteryTicketsCollection(id, authRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, function (authErr, jar) {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.getTickets(jar, options, function (err, tickets) {
      if (err) {
        logger.error(err);
        return callback(err);
      }

      return callback(null, tickets);
    });
  });

};

var createLotteryTicket = function createLotteryTicket(id, ticketRequest, options, callback) {
  return receiptsLotteryClient.sendLotteryTicket(ticketRequest, options, callback);
};

var getLotteryTradesCollection = function getLotteryTradesCollection(id, callback) {
  var trades = [];
  trades.push(
    new TradeResponseBuilder()
      .withId(Trade.VEHICLES)
      .withName('Konserwacja i naprawa samochodów osobowych oraz sprzedaż detaliczna części i akcesoriów do pojazdów samochodowych')
      .build()
  );
  trades.push(
    new TradeResponseBuilder()
      .withId(Trade.OTHER)
      .withName('Inne')
      .build()
  );

  return callback(null, new LotteryTradesCollectionResponseBuilder()
    .withTotal(trades.length)
    .withTrades(trades)
    .build());
};

var getLotteryResultsCollection = function getLotteryResultsCollection(id, options, callback) {

  results.getLotteryResultsCollection(options, function (err, collection) {
    if (err) {
      logger.error(err);
      return callback(err);
    }

    return callback(null, new LotteryResultsCollectionResponseBuilder()
      .withTotal(collection.length)
      .withResults(collection)
      .build());
  });

};

var getLotteryTicket = function getLotteryTicket(id, ticketId, authRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, function (authErr, jar) {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.getLotteryTicket(jar, ticketId, options, callback);
  });

};

var updateLotteryTicket = function updateLotteryTicket(id, ticketId, authRequest, updateTicketRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, function (authErr, jar) {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.updateLotteryTicket(jar, ticketId, updateTicketRequest, options, function (err/*, updateData*/) {
      if (err) {
        logger.error(err);
        return callback(err);
      }

      //don't use updateData, call get for details
      return receiptsLotteryClient.getLotteryTicket(jar, ticketId, options, callback);
    });
  });

};

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  getLotteryTradesCollection: getLotteryTradesCollection,
  getLotteryResultsCollection: getLotteryResultsCollection,
  getLotteryTicket: getLotteryTicket,
  updateLotteryTicket: updateLotteryTicket,
  VERSION: meta.VERSION
};