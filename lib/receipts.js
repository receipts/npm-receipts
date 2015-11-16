var meta = require('./meta');
var moment = require('moment');
var logger = require('./logger/logger').logger;
var receiptsLotteryClient = require('receipts-lottery-client');
var receiptsModel = require('receipts-model').model;
var receiptsEnum = require('receipts-model').enum;
var TradeResponseBuilder = receiptsModel.tradeResponse.TradeResponseBuilder;
var LotteryTradesCollectionResponseBuilder = receiptsModel.lotteryTradesCollectionResponse.LotteryTradesCollectionResponseBuilder;
var LotteryResultsCollectionResponseBuilder = receiptsModel.lotteryResultsCollectionResponse.LotteryResultsCollectionResponseBuilder;
var ResultResponseBuilder = receiptsModel.resultResponse.ResultResponseBuilder;
var ResultPrizeResponseBuilder = receiptsModel.resultPrizeResponse.ResultPrizeResponseBuilder;
var ResultPrizeWinnerResponseBuilder = receiptsModel.resultPrizeWinnerResponse.ResultPrizeWinnerResponseBuilder;
var ResultStatus = receiptsEnum.ResultStatus;

var getLotteryTicketsCollection = function getLotteryTicketsCollection(id, authRequest, options, callback) {
  logger.args('getLotteryTicketsCollection: ', arguments);


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
  //logger.args('createLotteryTicket: ', arguments);
  return receiptsLotteryClient.sendLotteryTicket(ticketRequest, options, callback);
};

var getLotteryTradesCollection = function getLotteryTradesCollection(id, callback) {
  var trades = [];
  trades.push(
    new TradeResponseBuilder()
      .withId('HAIRDRESSING')
      .withName('Fryzjerstwo i pozostałe zabiegi kosmetyczne')
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

var getLotteryResultsCollection = function getLotteryResultsCollection(id, callback) {
  var results = [];
  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody I stopnia')
      .withDate(moment('2015-11-16T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Astra')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AFP821JULTX')
              .build()
          ])
          .build()
      ])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody II stopnia')
      .withDate(moment('2015-11-27T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.ACTIVE)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Notebook Lenovo')
          .withWinners([])
          .build()])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody I stopnia')
      .withDate(moment('2015-12-21T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.PENDING)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Astra')
          .withWinners([])
          .build()
      ])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagroda specjalna')
      .withDate(moment('2016-01-18T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.PENDING)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Insignia')
          .withWinners([])
          .build()
      ])
      .build()
  );

  return callback(null, new LotteryResultsCollectionResponseBuilder()
    .withTotal(results.length)
    .withResults(results)
    .build());
};

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  getLotteryTradesCollection: getLotteryTradesCollection,
  getLotteryResultsCollection: getLotteryResultsCollection,
  VERSION: meta.VERSION
};