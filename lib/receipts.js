var meta = require('./meta');
var results = require('./results');
var logger = require('./logger/logger').logger;
var receiptsLotteryClient = require('receipts-lottery-client');
var receiptsModel = require('receipts-model').model;
var receiptsEnum = require('receipts-model').enum;
var TradeResponseBuilder = receiptsModel.tradeResponse.TradeResponseBuilder;
var LotteryTradesCollectionResponseBuilder = receiptsModel.lotteryTradesCollectionResponse.LotteryTradesCollectionResponseBuilder;
var LotteryResultsCollectionResponseBuilder = receiptsModel.lotteryResultsCollectionResponse.LotteryResultsCollectionResponseBuilder;
var Brand = receiptsEnum.Brand;

var getLotteryTicketsCollection = function getLotteryTicketsCollection(id, authRequest, options, callback) {

  return receiptsLotteryClient.authorizeUser(authRequest, options, function (err, jar) {
    if (err) {
      logger.error(err);
      return callback(err);
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
      .withId(Brand.PRIVATE_MEDIC_DENTAL)
      .withName('Prywatna praktyka lekarska i dentystyczna')
      .build()
  );
  trades.push(
    new TradeResponseBuilder()
      .withId('OTHER')
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

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  getLotteryTradesCollection: getLotteryTradesCollection,
  getLotteryResultsCollection: getLotteryResultsCollection,
  VERSION: meta.VERSION
};