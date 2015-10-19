var fs = require('fs');
var myRestifyApi = require('my-restify-api');
//var UnauthorizedError = myRestifyApi.error.UnauthorizedError;
//var ForbiddenError = myRestifyApi.error.ForbiddenError;
//var oauth = myRestifyApi.plugin.oauth;

var oauth = function oauth(req) {

  var context = {};
  context.user = function () {
  };

  context.client = function (client) {
    return context;
  };

  context.scope = function (scope) {
    return context;
  };

  return context;
};


var ticketsController = require('./controller/tickets');

var logger = require('./logger/logger').logger;
var receipts = require('./receipts');

var startServer = function startServer(callback) {
  fs.readFile('config/public.key', function (err, data) {
    if (err) {
      logger.debug('config/public.key read error: ', err);
      throw err;
    }

    var options = {
      appName: 'contests',
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
      }
    };

    var publicCacheHandler = function publicCacheHandler(req, res, next) {
      res.cache('public', {maxAge: 10});
      res.header('Vary', 'Accept-Language, Accept-Encoding, Accept, Content-Type');
      res.charSet('utf-8');
//    res.header('Last-Modified', new Date());
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
      del: []
    };


    routes.get.push({
      options: {
        path: '/api/contests/:id/tickets', version: '1.0.0'
      },
      authMethod: function readTicketsAuthHandler(req, res, next) {

        oauth(req)
          .scope('contests:tickets:get')
          .client('client')
          .user();

        return next();
      },
      cache: publicCacheHandler,
      controllerMethod: ticketsController.getContestTicketsCollectionV1
    });

    routes.post.push({
      options: {
        path: '/api/contests/:id/tickets', version: '1.0.0'
      },
      authMethod: function createTicketsAuthHandler(req, res, next) {

        oauth(req)
          .scope('contests:tickets:create')
          .client('client')
          .user();

        return next();
      },
      cache: noCacheHandler,
      controllerMethod: ticketsController.createContestTicketV1
    });

    var server = myRestifyApi.createServer(routes, errorHandlers, options);

    server.opts(/.*/, function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));
      res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
      res.send(200);
      return next();
    });

    myRestifyApi.runServer(server, options, function (err, port) {
      logger.debug('myRestifyApi running on port: %d', port);
      return callback(err, port);
    });
  });
};

module.exports = {
  startServer: startServer
};
