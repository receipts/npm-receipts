var meta = require('./meta');
var logger = require('./logger/logger').logger;
var receiptsLotteryClient = require('receipts-lottery-client');
var receiptsModel = require('receipts-model').model;
var TradeResponseBuilder = receiptsModel.tradeResponse.TradeResponseBuilder;
var LotteryTradesCollectionResponseBuilder = receiptsModel.lotteryTradesCollectionResponse.LotteryTradesCollectionResponseBuilder;

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

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  getLotteryTradesCollection: getLotteryTradesCollection,
  VERSION: meta.VERSION
};