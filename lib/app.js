'use strict';

var fs = require('fs');
var myRestifyApi = require('my-restify-api');
var oauth = myRestifyApi.plugin.oauth;

var ticketsController = require('./controller/tickets');
var tradesController = require('./controller/trades');
var resultsController = require('./controller/results');

var logger = require('./logger/logger').logger;

var startServer = function startServer(callback) {
  return fs.readFile('config/public.key', function (err, data) {
    if (err) {
      logger.debug('config/public.key read error: ', err);
      throw err;
    }

    var options = {
      appName: 'lotteries',
      swagger: {
        enabled: true,
        apiDocsDir: __dirname + '/../public/'
      },
      authorization: {
        authHeaderPrefix: 'x-auth-',
        key: data,
        noVerify: false
      },
      bodyParser: {
        enabled: true,
        options: {
          maxBodySize: 1e6,
          mapParams: true,
          overrideParams: false
        }
      },
      acceptable: [
        'application/vnd.receipts.v1+json',
        'application/vnd.receipts.v1+xml'
      ]
    };

    var errorHandlers = {
      ServiceUnavailable: {
        className: 'ServiceUnavailableError'
      },
      '': {
        className: 'ServiceUnavailableError'
      },
      UnauthorizedUser: {
        className: 'ForbiddenError'
      },
      AlreadyExists: {
        className: 'ForbiddenError'
      },
      UnknownValidate: {
        className: 'BadRequestError'
      },
      InvalidPointOfSale: {
        className: 'BadRequestError'
      },
      InvalidPurchaseOrderNumber: {
        className: 'BadRequestError'
      },
      InvalidDate: {
        className: 'BadRequestError'
      },
      InvalidAmount: {
        className: 'BadRequestError'
      },
      InvalidTaxRegistrationNumber: {
        className: 'BadRequestError'
      },
      InvalidEmail: {
        className: 'BadRequestError'
      },
      InvalidPhone: {
        className: 'BadRequestError'
      },
      InvalidTrade: {
        className: 'BadRequestError'
      },
      TicketNotFound: {
        className: 'NotFoundError'
      }
    };

    var userTicketCacheHandler = function userTicketCacheHandler(req, res, next) {
      res.cache('private', {maxAge: 10});
      res.header('Vary', 'Accept-Language, Accept-Encoding, Accept, Content-Type, UserAuth');
      res.charSet('utf-8');
      return next();
    };

    var publicCacheHandler = function publicCacheHandler(req, res, next) {
      res.cache('public', {maxAge: 600});
      res.header('Vary', 'Accept-Language, Accept-Encoding, Accept, Content-Type');
      res.charSet('utf-8');
      return next();
    };

    var noCacheHandler = function noCacheHandler(req, res, next) {
      res.cache('private');
      res.charSet('utf-8');
      return next();
    };

    var noPreconditionHandler = function noPreconditionHandler(req, res, next) {
      return next();
    };

    var routes = {
      get: [],
      post: [],
      put: [],
      delete: []
    };

    routes.get.push({
      options: {
        path: '/api/lotteries/:id/results', version: '1.0.0'
      },
      authMethod: function readResulthAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:results:get')
          .user()
          .next();
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: resultsController.getLotteryResultsCollectionV1
    });

    routes.get.push({
      options: {
        path: '/api/lotteries/:id/trades', version: '1.0.0'
      },
      authMethod: function readTradesAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:trades:get')
          .user()
          .next();
      },
      cache: publicCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: tradesController.getLotteryTradesCollectionV1
    });

    routes.get.push({
      options: {
        path: '/api/lotteries/:id/tickets', version: '1.0.0'
      },
      authMethod: function readTicketsAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:tickets:get')
          .user()
          .next();
      },
      cache: userTicketCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: ticketsController.getLotteryTicketsCollectionV1
    });

    routes.post.push({
      options: {
        path: '/api/lotteries/:id/tickets', version: '1.0.0'
      },
      authMethod: function createTicketAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:tickets:create')
          .user()
          .next();
      },
      cache: noCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: ticketsController.createLotteryTicketV1
    });

    routes.get.push({
      options: {
        path: '/api/lotteries/:id/tickets/:ticketId', version: '1.0.0'
      },
      authMethod: function readTicketAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:tickets:get')
          .user()
          .next();
      },
      cache: userTicketCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: ticketsController.getLotteryTicketV1
    });

    routes.put.push({
      options: {
        path: '/api/lotteries/:id/tickets/:ticketId', version: '1.0.0'
      },
      authMethod: function updateTicketAuthHandler(req, res, next) {

        return oauth(req, next)
          .scope('lotteries:tickets:update')
          .user()
          .next();
      },
      cache: noCacheHandler,
      precondition: noPreconditionHandler,
      controllerMethod: ticketsController.updateLotteryTicketV1
    });

    var server = myRestifyApi.createServer(routes, errorHandlers, options);

    server.opts(/.*/, function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));
      res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
      res.send(200);
      return next();
    });

    return myRestifyApi.runServer(server, options, function (serverErr, port) {
      logger.debug('myRestifyApi running on port: %d', port);
      return callback(serverErr, port);
    });
  });
};

module.exports = {
  startServer: startServer
};
