var Keen = require('keen-js');
var config = require('config');
var extend = require('util')._extend;
var logger = require('./logger/logger').logger;

var client = new Keen(config.keen);

var errorEvent = function (auth, input, err) {
  logger.debug('save errorEvent:', err);

  var event = extend(
    {
      keen: {
        timestamp: new Date().toISOString()
      },
      input: input,
      auth: auth
    }, err);

  client.addEvent('errorEvent', event, function (err) {
    if (err) {
      logger.warn('errorEvent save err:', err);
    }
  });
};

var createContestTicket = function createContestTicket(auth, input, ticketEvent) {
  logger.debug('save createContestsTicket event:', ticketEvent);

  var event = extend(
    {
      keen: {
        timestamp: new Date().toISOString()
      },
      input: input,
      auth: auth
    }, ticketEvent);

  client.addEvent('ticketEvents', event, function (err) {
    if (err) {
      logger.warn('ticketEvent save err:', err);
    }
  });
};

module.exports = {
  errorEvent: errorEvent,
  createContestTicket: createContestTicket
};