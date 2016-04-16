'use strict';

var moment = require('moment');
var logger = require('./logger/logger').logger;
var receiptsLotteryClient = require('receipts-lottery-client');
var receiptsModel = require('receipts-model').model;
var receiptsEnum = require('receipts-model').enum;
var ResultResponseBuilder = receiptsModel.resultResponse.ResultResponseBuilder;
var ResultPrizeResponseBuilder = receiptsModel.resultPrizeResponse.ResultPrizeResponseBuilder;
var ResultPrizeWinnerResponseBuilder = receiptsModel.resultPrizeWinnerResponse.ResultPrizeWinnerResponseBuilder;
var ResultStatus = receiptsEnum.ResultStatus;

//Nagrody I stopnia: Opel Astra, 2x iPad Air 2
var PRIZES_I_LEVEL = [
  '16.11.2015',
  '21.12.2015',
  '18.01.2016',
  '15.02.2016',
  '21.03.2016',
  '18.04.2016',
  '16.05.2016',
  '20.06.2016',
  '18.07.2016',
  '16.08.2016',
  '19.09.2016',
  '17.10.2016'
];

//Nagrody II stopnia: 6x Notebook Lenovo, 5x iPad Air 2
var PRIZES_II_LEVEL = [
  '27.11.2015',
  '28.12.2015',
  '29.01.2016',
  '26.02.2016',
  '25.03.2016',
  '29.04.2016',
  '27.05.2016',
  '24.06.2016',
  '29.07.2016',
  '26.08.2016',
  '30.09.2016',
  '28.10.2016'
];


//Nagroda specjalna: Opel Insignia
var PRIZES_SPECIAL = [
  '18.01.2016',
  '18.04.2016',
  '18.07.2016',
  '17.10.2016'
];


var groupByPrizes = function groupByPrizes(name, prizesList, date, collection) {
  logger.debug('groupByPrizes: ', name, date);

  var prizes = [];
  var winners = {};

  for (var i in collection) {
    if (collection.hasOwnProperty(i)) {
      var elem = collection[i];

      if (elem.date === date && prizesList.indexOf(elem.prize) > -1) {

        if (!winners.hasOwnProperty(elem.prize)) {
          winners[elem.prize] = [];
        }

        winners[elem.prize].push(new ResultPrizeWinnerResponseBuilder()
          .withCode(elem.code)
          .withName(elem.name)
          .withType(elem.type)
          .build());
      }
    }
  }

  if (Object.keys(winners).length) {
    for (var prize in winners) {
      if (winners.hasOwnProperty(prize)) {
        prizes.push(new ResultPrizeResponseBuilder()
            .withName(prize)
            .withWinners(winners[prize])
            .build()
        );
      }
    }
  }
  else {
    for (var j in prizesList) {
      if (prizesList.hasOwnProperty(j)) {
        prizes.push(new ResultPrizeResponseBuilder()
            .withName(prizesList[j])
            .withWinners([])
            .build()
        );
      }
    }
  }

  var status = Object.keys(winners).length ? ResultStatus.FINISHED : ResultStatus.ACTIVE;

  return new ResultResponseBuilder()
    .withName(name)
    .withDate(moment(date, 'DD.MM.YYYY').seconds(0).minutes(0).hours(21).toISOString())
    .withStatus(status)
    .withPrizes(prizes)
    .build();
};

var sortByDate = function sortByDate(one, two) {
  var a = moment(one.date);
  var b = moment(two.date);

  if (a.valueOf() < b.valueOf()) {
    return -1;
  }
  if (a.valueOf() > b.valueOf()) {
    return 1;
  }

  return 0;
};

var filterActive = function filterActive(results) {
  var activeCount = 0;
  return results.filter(function (result) {

    switch (result.status) {
      case ResultStatus.ACTIVE:
        ++activeCount;
        if (activeCount > 1) {
          return false;
        }
        break;
      default :
    }
    return true;
  });
};

var getLotteryResultsCollection = function getLotteryResultsCollection(options, callback) {

  receiptsLotteryClient.getResults(options, function (err, collection) {
    if (err) {
      logger.error(err);
      return callback(err);
    }

    logger.debug('getLotteryResultsCollection.collection: ', collection);

    var results = [];
    var resultsLevel = [];

    PRIZES_I_LEVEL.map(function (date) {
      resultsLevel.push(groupByPrizes('Nagrody I stopnia', ['Opel Astra', 'iPad Air 2'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));
    resultsLevel = [];

    PRIZES_II_LEVEL.map(function (date) {
      resultsLevel.push(groupByPrizes('Nagrody II stopnia', ['Lenovo ThinkPad', 'iPad Air 2'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));
    resultsLevel = [];

    PRIZES_SPECIAL.map(function (date) {
      resultsLevel.push(groupByPrizes('Nagroda specjalna', ['Opel Insignia'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));

    return callback(err, results.sort(sortByDate));
  });

};

module.exports = {
  getLotteryResultsCollection: getLotteryResultsCollection
};