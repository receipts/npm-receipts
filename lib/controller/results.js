'use strict';

const assert = require('assert-plus');
const options = require('config');
const myRestifyApi = require('my-restify-api');
const BadRequestError = myRestifyApi.error.BadRequestError;
const receipts = require('../receipts');
const keen = require('../keen');

const getLotteryResultsCollectionV1 = function getLotteryResultsCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  const id = req.params.id;

  return receipts.getLotteryResultsCollection(id, options, (err, response) => {
    next.ifError(err);

    res.send(200, response);
    next();

    const keenData = {
    };

    return keen.getResultsCollection(req.authorization.bearer, keenData);
  });
};

module.exports = {
  getLotteryResultsCollectionV1: getLotteryResultsCollectionV1
};
