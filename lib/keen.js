'use strict';

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

  client.addEvent('errorEvent', event, function (clientErr) {
    if (clientErr) {
      logger.warn('errorEvent save err:', clientErr);
    }
  });
};

var createLotteryTicket = function createLotteryTicket(auth, ticketData) {
  logger.debug('save createLotteryTicket event:', ticketData);

  var event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: ticketData,
    auth: auth
  };

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

var getResultsCollection = function getResultsCollection(auth, input) {
  logger.debug('save getResultsCollection event:', input);

  var event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getResultsCollection', event, function (err) {
    if (err) {
      logger.warn('getResultsCollection save err:', err);
    }
  });
};

var getTradesCollection = function getTradesCollection(auth, input) {
  logger.debug('save getTradesCollection event:', input);

  var event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getTradesCollection', event, function (err) {
    if (err) {
      logger.warn('getTradesCollection save err:', err);
    }
  });
};

module.exports = {
  errorEvent: errorEvent,
  createLotteryTicket: createLotteryTicket,
  getResultsCollection: getResultsCollection,
  getTradesCollection: getTradesCollection,
  getTicketsCollection: getTicketsCollection
};