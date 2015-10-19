var meta = require('./meta');
var logger = require('./logger/logger').logger;

var getLotteryTicketsCollection = function getLotteryTicketsCollection(id, limit, offset, sort, callback) {
  logger.args('getLotteryTicketsCollection: ', arguments);
  return callback(null, {});
};

var createLotteryTicket = function createLotteryTicket(id, ticketRequest, callback) {
  logger.args('createLotteryTicket: ', arguments);
  return callback(null, {});
};

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  VERSION: meta.VERSION
};