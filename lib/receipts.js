var meta = require('./meta');
var logger = require('./logger/logger').logger;

var getContestTicketsCollection = function getContestTicketsCollection(id, limit, offset, sort, callback) {
  logger.args('getContestTicketsCollection: ', arguments);
  return callback(null, {});
};

var createContestTicket = function createContestTicket(id, ticketRequest, callback) {
  logger.args('createContestTicket: ', arguments);
  return callback(null, {});
};

module.exports = {
  getContestTicketsCollection: getContestTicketsCollection,
  createContestTicket: createContestTicket,
  VERSION: meta.VERSION
};