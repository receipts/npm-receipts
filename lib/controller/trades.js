'use strict';

var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var BadRequestError = myRestifyApi.error.BadRequestError;
var receipts = require('../receipts');
var keen = require('../keen');

var getLotteryTradesCollectionV1 = function getLotteryTradesCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;

  return receipts.getLotteryTradesCollection(id, (err, response) => {
    next.ifError(err);

    res.send(200, response);
    next();

    var keenData = {
    };

    return keen.getTradesCollection(req.authorization.bearer, keenData);
  });
};

module.exports = {
  getLotteryTradesCollectionV1: getLotteryTradesCollectionV1
};
