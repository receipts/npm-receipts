var chai = require('chai');
var should = chai.should();
var receipts = require('../lib/receipts');

describe('index test', function () {

  it('should export getLotteryTicketsCollection', function (done) {

    var getLotteryTicketsCollection = receipts.getLotteryTicketsCollection;
    should.exist(getLotteryTicketsCollection);
    done();
  });

  it('should export createLotteryTicket', function (done) {

    var createLotteryTicket = receipts.createLotteryTicket;
    should.exist(createLotteryTicket);
    done();
  });

  it('should export meta version', function (done) {

    var version = receipts.VERSION;
    should.exist(version);
    done();
  });
});