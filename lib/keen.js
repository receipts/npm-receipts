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

var createLotteryTicket = function createLotteryTicket(auth, input, ticketEvent) {
  logger.debug('save createLotteryTicket event:', ticketEvent);

  var event = extend(
    {
      keen: {
        timestamp: new Date().toISOString()
      },
      input: input,
      auth: auth
    }, ticketEvent);

  client.addEvent('ticketCreateEvents', event, function (err) {
    if (err) {
      logger.warn('ticketCreateEvents save err:', err);
    }
  });
};

var getTicketsCollection = function getTicketsCollection(auth, input) {
  logger.debug('save getTicketsCollection event:', input);

  var event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getTicketsCollection', event, function (err) {
    if (err) {
      logger.warn('getTicketsCollection save err:', err);
    }
  });
};

module.exports = {
  errorEvent: errorEvent,
  createLotteryTicket: createLotteryTicket,
  getTicketsCollection: getTicketsCollection
};