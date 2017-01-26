'use strict';

const Keen = require('keen-js');
const config = require('config');
const extend = require('util')._extend;
const logger = require('./logger/logger').logger;

const client = new Keen(config.keen);

const errorEvent = (auth, input, err) => {
  logger.debug('save errorEvent:', err);

  const event = extend(
    {
      keen: {
        timestamp: new Date().toISOString()
      },
      input: input,
      auth: auth
    }, err);

  client.addEvent('errorEvent', event, clientErr => {
    if (clientErr) {
      logger.warn('errorEvent save err:', clientErr);
    }
  });
};

const createLotteryTicket = function createLotteryTicket(auth, ticketData) {
  logger.debug('save createLotteryTicket event:', ticketData);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: ticketData,
    auth: auth
  };

  client.addEvent('ticketCreateEvents', event, err => {
    if (err) {
      logger.warn('ticketCreateEvents save err:', err);
    }
  });
};

const getTicketsCollection = function getTicketsCollection(auth, input) {
  logger.debug(`save getTicketsCollection event: ${input}`);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getTicketsCollection', event, err => {
    if (err) {
      logger.warn('getTicketsCollection save err:', err);
    }
  });
};

const getResultsCollection = function getResultsCollection(auth, input) {
  logger.debug(`save getResultsCollection event: ${input}`);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getResultsCollection', event, err => {
    if (err) {
      logger.warn('getResultsCollection save err:', err);
    }
  });
};

const getTradesCollection = function getTradesCollection(auth, input) {
  logger.debug(`save getTradesCollection event: ${input}`);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getTradesCollection', event, err => {
    if (err) {
      logger.warn('getTradesCollection save err:', err);
    }
  });
};

const updateTicket = function updateTicket(auth, input) {
  logger.debug(`save updateTicket event: ${input}`);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('updateTicket', event, err => {
    if (err) {
      logger.warn('updateTicket save err:', err);
    }
  });
};

const getTicket = function getTicket(auth, input) {
  logger.debug(`save getTicket event: ${input}`);

  const event = {
    keen: {
      timestamp: new Date().toISOString()
    },
    input: input,
    auth: auth
  };

  client.addEvent('getTicket', event, err => {
    if (err) {
      logger.warn('getTicket save err:', err);
    }
  });
};

module.exports = {
  errorEvent: errorEvent,
  createLotteryTicket: createLotteryTicket,
  getResultsCollection: getResultsCollection,
  getTradesCollection: getTradesCollection,
  getTicketsCollection: getTicketsCollection,
  updateTicket: updateTicket,
  getTicket: getTicket
};