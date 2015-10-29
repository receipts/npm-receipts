var meta = require('./meta');
var logger = require('./logger/logger').logger;

//var receiptsModel = require('receipts-model').model;
//var TicketRequestBuilder = receiptsModel.ticketRequest.TicketRequestBuilder;
var receiptsLotteryClient = require('receipts-lottery-client');

var getLotteryTicketsCollection = function getLotteryTicketsCollection(id, limit, offset, sort, callback) {
  logger.args('getLotteryTicketsCollection: ', arguments);
  return callback(null, {});
};

var createLotteryTicket = function createLotteryTicket(id, ticketRequest, options, callback) {
  //logger.args('createLotteryTicket: ', arguments);
  return receiptsLotteryClient.lotteryTicket(ticketRequest, options, callback);
};

module.exports = {
  getLotteryTicketsCollection: getLotteryTicketsCollection,
  createLotteryTicket: createLotteryTicket,
  VERSION: meta.VERSION
};