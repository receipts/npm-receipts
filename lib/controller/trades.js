'use strict';

const assert = require('assert-plus');
const myRestifyApi = require('my-restify-api');
const BadRequestError = myRestifyApi.error.BadRequestError;
const receipts = require('../receipts');
const keen = require('../keen');

const getLotteryTradesCollectionV1 = function getLotteryTradesCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  const id = req.params.id;

  return receipts.getLotteryTradesCollection(id, (err, response) => {
    next.ifError(err);

    res.send(200, response);
    next();

    const keenData = {
    };

    return keen.getTradesCollection(req.authorization.bearer, keenData);
  });
};

module.exports = {
  getLotteryTradesCollectionV1: getLotteryTradesCollectionV1
};
