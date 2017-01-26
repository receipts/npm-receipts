'use strict';

const meta = require('./meta');
const results = require('./results');
const logger = require('./logger/logger').logger;
const receiptsLotteryClient = require('receipts-lottery-client');
const receiptsModel = require('receipts-model').model;
const receiptsEnum = require('receipts-model').enum;
const TradeResponseBuilder = receiptsModel.tradeResponse.TradeResponseBuilder;
const LotteryTradesCollectionResponseBuilder = receiptsModel.lotteryTradesCollectionResponse.LotteryTradesCollectionResponseBuilder;
const LotteryResultsCollectionResponseBuilder = receiptsModel.lotteryResultsCollectionResponse.LotteryResultsCollectionResponseBuilder;
const Trade = receiptsEnum.Trade;

const getLotteryTicketsCollection = function getLotteryTicketsCollection(id, authRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, (authErr, jar) => {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.getTickets(jar, options, (err, tickets) => {
      if (err) {
        logger.error(err);
        return callback(err);
      }

      return callback(null, tickets);
    });
  });

};

const createLotteryTicket = function createLotteryTicket(id, ticketRequest, options, callback) {
  return receiptsLotteryClient.sendLotteryTicket(ticketRequest, options, callback);
};

const getLotteryTradesCollection = function getLotteryTradesCollection(id, callback) {
  const trades = [];

  trades.push(
    new TradeResponseBuilder()
      .withId(Trade.FUEL)
      .withName('Sprzedaż detaliczna paliw do pojazdów silnikowych na stacjach paliw')
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

const getLotteryResultsCollection = function getLotteryResultsCollection(id, options, callback) {

  return results.getLotteryResultsCollection(options, (err, collection) => {
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

const getLotteryTicket = function getLotteryTicket(id, ticketId, authRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, (authErr, jar) => {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.getLotteryTicket(jar, ticketId, options, callback);
  });

};

const updateLotteryTicket = function updateLotteryTicket(id, ticketId, authRequest, updateTicketRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, (authErr, jar) => {
    if (authErr) {
      logger.error(authErr);
      return callback(authErr);
    }

    return receiptsLotteryClient.updateLotteryTicket(jar, ticketId, updateTicketRequest, options, err/*, updateData*/ => {
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