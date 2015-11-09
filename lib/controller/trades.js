var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var BadRequestError = myRestifyApi.error.BadRequestError;
var receipts = require('../receipts');

var getLotteryTradesCollectionV1 = function getLotteryTradesCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;

  receipts.getLotteryTradesCollection(id, function (err, response) {
    next.ifError(err);

    res.send(200, response);
    return next();
  });
};

module.exports = {
  getLotteryTradesCollectionV1: getLotteryTradesCollectionV1
};
