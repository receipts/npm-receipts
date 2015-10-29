var options = require('config');
var moment = require('moment');
var assert = require('assert-plus');
var myRestifyApi = require('my-restify-api');
var receiptsModel = require('receipts-model').model;
var TicketResponseBuilder = receiptsModel.ticketResponse.TicketResponseBuilder;
var LotteryTicketsCollectionResponseBuilder = receiptsModel.lotteryTicketsCollectionResponse.LotteryTicketsCollectionResponseBuilder;
var AmountResponseBuilder = receiptsModel.amountResponse.AmountResponseBuilder;
var BadRequestError = myRestifyApi.error.BadRequestError;
var ForbiddenError = myRestifyApi.error.ForbiddenError;
var InternalError = myRestifyApi.error.InternalError;
var keen = require('../keen');
var cheerio = require('cheerio');
var receipts = require('../receipts');

var getLotteryTicketsCollectionV1 = function getLotteryTicketsCollectionV1(req, res, next) {
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

  receipts.getLotteryTicketsCollection(id, limit, offset, sort, function (err, data) {
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


    var collection = new LotteryTicketsCollectionResponseBuilder()
      .withTotal(1)
      .withTickets([ticket])
      .build();

    res.send(200, collection);
    return next();
  });
};

var createLotteryTicketV1 = function createLotteryTicketV1(req, res, next) {
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
    assert.bool(req.params.agreements.termsOfService, 'agreements.termsOfService');
    assert.bool(req.params.agreements.personalDataProcessing, 'agreements.personalDataProcessing');
    assert.bool(req.params.agreements.useMyEffigy, 'agreements.useMyEffigy');
  }
  catch (e) {
    return next(new BadRequestError(e.message));
  }

  if (req.params.amount.value < 10) {
    return next(new BadRequestError('kwota musi być nie mniejsza od 10 złotych'));
  }

  var id = req.params.id;
  var ticketRequest = req.params;

  receipts.createLotteryTicket(id, ticketRequest, options, function (err, data) {
    if (err) {
      keen.errorEvent(req.authorization.bearer, {}, err);
    }

    next.ifError(err);

    var json = JSON.parse(data);

    if (json.hasOwnProperty('success')) {

      if (!json.success) {

        if (json.message.indexOf("paragon fiskalny został już zgłoszony.") > -1) {
          return next(new ForbiddenError('Ticket already exists', json.message));
        }

        return next(new BadRequestError('Unable to validate parameters', json.message));
      }
      else {
        var $ = cheerio.load(json.message);
        var id = $('.recipe-number', '.ty-form').text();

        var now = moment().toISOString();

        var amount = new AmountResponseBuilder()
          .withCurrency('PLN')
          .withValue(ticketRequest.amount.value)
          .build();

        var response = new TicketResponseBuilder()
          .withId(id)
          .withPurchaseOrderNumber(ticketRequest.purchaseOrderNumber)
          .withAmount(amount)
          .withDate(moment(ticketRequest.date).toISOString())
          .withCreatedAt(now)
          .withUpdatedAt(now)
          .build();

        res.send(201, response);
        next();

        return keen.createLotteryTicket(req.authorization.bearer, {}, data);
      }
    }
    else {
      if (json.hasOwnProperty('nr_kasy')) {
        return next(new BadRequestError('Invalid pointOfSale number', json.nr_kasy.join(',')));
      }

      if (json.hasOwnProperty('miesiac')) {
        return next(new BadRequestError('Invalid date', json.miesiac.join(',')));
      }

      if (json.hasOwnProperty('kwota_zl')) {
        return next(new BadRequestError('Invalid amount value', json.kwota_zl.join(',')));
      }

      if (json.hasOwnProperty('nip')) {
        if (json.nip.length > 1) {
          return next(new BadRequestError('Invalid taxRegistrationNumber number', json.nip[1]));
        }
        else {
          return next(new BadRequestError('Invalid taxRegistrationNumber number', json.nip[0]));
        }
      }
    }

    return next(new InternalError('Unknown exception'));
  });
};

module.exports = {
  getLotteryTicketsCollectionV1: getLotteryTicketsCollectionV1,
  createLotteryTicketV1: createLotteryTicketV1
};
