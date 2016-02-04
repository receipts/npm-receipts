var assert = require('assert-plus');
var options = require('config');
var myRestifyApi = require('my-restify-api');
var BadRequestError = myRestifyApi.error.BadRequestError;
var receipts = require('../receipts');
var keen = require('../keen');

var getLotteryResultsCollectionV1 = function getLotteryResultsCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;

  receipts.getLotteryResultsCollection(id, options, function (err, response) {
    next.ifError(err);

    res.send(200, response);
    next();

    var keenData = {
    };

    return keen.getResultsCollection(req.authorization.bearer, keenData);
  });
};

module.exports = {
  getLotteryResultsCollectionV1: getLotteryResultsCollectionV1
};
