var meta = require('./meta');
var logger = require('./logger/logger').logger;

var receiptsLotteryClient = require('receipts-lottery-client');

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

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  VERSION: meta.VERSION
};