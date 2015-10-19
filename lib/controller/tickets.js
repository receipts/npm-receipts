var options = require('config');
var moment = require('moment');
var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var receiptsModel = require('receipts-model').model;
var TicketResponseBuilder = receiptsModel.ticketResponse.TicketResponseBuilder;
var ContestTicketsCollectionResponseBuilder = receiptsModel.contestTicketsCollectionResponse.ContestTicketsCollectionResponseBuilder;
var AmountResponseBuilder = receiptsModel.amountResponse.AmountResponseBuilder;
var BadRequestError = myRestifyApi.error.BadRequestError;
var keen = require('../keen');

var receipts = require('../receipts');


var getContestTicketsCollectionV1 = function getContestTicketsCollectionV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.optionalString(req.params.limit, 'limit');
    assert.optionalString(req.params.offset, 'offset');
    assert.optionalString(req.params.sort, 'sort');

  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;
  var limit = req.params.limit || '100';
  var offset = req.params.offset;
  var sort = req.params.sort;

  receipts.getContestTicketsCollection(id, limit, offset, sort, function (err, data) {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    var amount = new AmountResponseBuilder()
      .withCurrency('PLN')
      .withValue('12.66')
      .build();

    var ticket = new TicketResponseBuilder()
      .withId('B2DIAGQYD45')
      .withPurchaseOrderNumber('W545378')
      .withAmount(amount)
      .withDate(moment('2015-10-17').toISOString())
      .build();


    var collection = new ContestTicketsCollectionResponseBuilder()
      .withTotal(1)
      .withTickets([ticket])
      .build();

    res.send(200, collection);
    return next();
  });
};

var createContestTicketV1 = function createContestTicketV1(req, res, next) {
  try {
    assert.object(req.params, 'params');
    assert.string(req.params.id, 'id');
    assert.string(req.params.pointOfSale, 'pointOfSale');
    assert.string(req.params.purchaseOrderNumber, 'purchaseOrderNumber');
    assert.object(req.params.amount, 'amount');
    assert.string(req.params.amount.currency, 'amount.currency');
    assert.string(req.params.amount.value, 'amount.value');
    assert.string(req.params.date, 'date');
    assert.string(req.params.taxRegistrationNumber, 'taxRegistrationNumber');
    assert.string(req.params.phone, 'phone');
    assert.string(req.params.trade, 'trade');
    assert.object(req.params.agreements, 'agreements');
    assert.string(req.params.agreements.termsOfService, 'agreements.termsOfService');
    assert.string(req.params.agreements.personalDataProcessing, 'agreements.personalDataProcessing');
    assert.string(req.params.agreements.useMyEffigy, 'agreements.useMyEffigy');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  var id = req.params.id;
  var ticketRequest = req.params;

  receipts.createContestTicket(id, ticketRequest, function (err, data) {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    var now = moment().toISOString();

    var amount = new AmountResponseBuilder()
      .withCurrency('PLN')
      .withValue('12.66')
      .build();

    var response = new TicketResponseBuilder()
      .withId('B2DIAGQYD45')
      .withPurchaseOrderNumber('W545378')
      .withAmount(amount)
      .withDate(moment('2015-10-17').toISOString())
      .withCreatedAt(now)
      .withUpdatedAt(now)
      .build();

    //
    //var response = new TicketResponseBuilder()
    //  .withId(data.id)
    //  .withPurchaseOrderNumber(ticketRequest.purchaseOrderNumber)
    //  .withAmount(ticketRequest.amount)
    //  .withDate(ticketRequest.date)
    //  .withCreatedAt(now)
    //  .withUpdatedAt(now)
    //  .build();

    res.send(201, response);
    next();

    return keen.createContestTicket(req.authorization.bearer, {}, data);
  });
};

module.exports = {
  getContestTicketsCollectionV1: getContestTicketsCollectionV1,
  createContestTicketV1: createContestTicketV1
};
