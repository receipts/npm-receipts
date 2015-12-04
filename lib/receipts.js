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
      .withName('Nagrody II stopnia')
      .withDate(moment('2015-11-27T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Lenovo ThinkPad')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AMPZHCJK4DX')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('ASXD65DW04X')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AIBAGPJHYSW')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AA5DIRW5I52')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('APB1PDR5HIF')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A2H6EK8GJW7')
              .build()
          ])
          .build(),
        new ResultPrizeResponseBuilder()
          .withName('iPad Air 2')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('ACARFMP3K3N')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A1V5ZFZA5KD')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AVJMTB8ZTML')
              .build()

          ])
          .build()
      ])
      .build()
  );

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
          .build(),
        new ResultPrizeResponseBuilder()
          .withName('iPad Air 2')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A9TEAYIJKER')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A4Y70MN4L8A')
              .build()
          ])
          .build()
      ])
      .build()
  );


  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody I stopnia')
      .withDate(moment('2015-12-21T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.ACTIVE)
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
      .withName('Nagrody II stopnia')
      .withDate(moment('2015-12-28T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.ACTIVE)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Lenovo ThinkPad')
          .withWinners([])
          .build()
      ])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagroda specjalna')
      .withDate(moment('2016-01-18T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.ACTIVE)
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