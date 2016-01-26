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

var getLotteryResultsCollection = function getLotteryResultsCollection(id, callback) {
  var results = [];


  results.push(
    new ResultResponseBuilder()
      .withName('Nagroda specjalna')
      .withDate(moment('2016-01-18T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Insignia')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BGW7EKMCDGW')
              .build()
          ])
          .build()
      ])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody I stopnia')
      .withDate(moment('2016-01-18T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Astra')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('CH9J413YUQW')
              .build()
          ])
          .build()
      ])
      .build()
  );


  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody II stopnia')
      .withDate(moment('2015-12-28T20:00:00.000Z').toISOString())
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('iPad Air 2')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BS64W0XL1PL')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BB9IP0K5BKZ')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BG74D4VFH43')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BCHUC7PNQC5')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('B5W8NW2CKSP')
              .build()
          ])
          .build(),
        new ResultPrizeResponseBuilder()
          .withName('Lenovo ThinkPad')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BKFA5DJWAQT')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('B1ADB5PLCB9')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BPXRNS75ABP')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BR4IJFA1ZK9')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BBC4RGMK347')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BYQAENLHE8W')
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
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Opel Astra')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BRCWPV6FJUU')
              .build()
          ])
          .build(),
        new ResultPrizeResponseBuilder()
          .withName('iPad Air 2')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BHFF8MMZCBY')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('BUB6DJ4D80W')
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
      .withStatus(ResultStatus.FINISHED)
      .withPrizes([
        new ResultPrizeResponseBuilder()
          .withName('Lenovo ThinkPad')
          .withWinners([
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A719NN6AM93')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AHCT63AJ053')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('ADPUV79YT6T')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AXAXUE3QW84')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('ANLWWDW1DVN')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AREKFDTQC9B')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AUIM0NAQYA9')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A01WKZ1SRCH')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AFK82GBBC8A')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AWCUT365Z1H')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AQU9AWJHHDY')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AIN1KJB6LWF')
              .build(),
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
              .withCode('A8JNHX86NHE')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AIRDP7YLFHV')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A5LI8DKIKYC')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A0M6TUQBMNA')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AINI931CQ9I')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A4L0EXJ8S41')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AB7DFVNZIEH')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AE1ZVTGYYF0')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A57DGRDCRK3')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('AGC0QA6IGNK')
              .build(),
            new ResultPrizeWinnerResponseBuilder()
              .withCode('A4US3WH3AY1')
              .build(),
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
              .withCode('A4Y70MN4L8A')
              .build()
          ])
          .build()
      ])
      .build()
  );

  results.push(
    new ResultResponseBuilder()
      .withName('Nagrody II stopnia')
      .withDate(moment('2016-01-29T20:00:00.000Z').toISOString())
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
      .withName('Nagrody I stopnia')
      .withDate(moment('2016-02-15T20:00:00.000Z').toISOString())
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
      .withName('Nagroda specjalna')
      .withDate(moment('2016-04-18T20:00:00.000Z').toISOString())
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