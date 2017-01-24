'use strict';

const moment = require('moment');
const logger = require('./logger/logger').logger;
const receiptsLotteryClient = require('receipts-lottery-client');
const receiptsModel = require('receipts-model').model;
const receiptsEnum = require('receipts-model').enum;
const ResultResponseBuilder = receiptsModel.resultResponse.ResultResponseBuilder;
const ResultPrizeResponseBuilder = receiptsModel.resultPrizeResponse.ResultPrizeResponseBuilder;
const ResultPrizeWinnerResponseBuilder = receiptsModel.resultPrizeWinnerResponse.ResultPrizeWinnerResponseBuilder;
const ResultStatus = receiptsEnum.ResultStatus;

//Nagrody I stopnia: Opel Astra, 2x iPad Air 2
const PRIZES_I_LEVEL = [
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
  '17.10.2016',
  '21.11.2016',
  '16.01.2017',
  '20.02.2017',
  '20.03.2017',
  '18.04.2017'
];

//Nagrody II stopnia: 6x Notebook Lenovo, 5x iPad Air 2
const PRIZES_II_LEVEL = [
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
  '28.10.2016',
  '25.11.2016',
  '30.12.2016',
  '27.01.2017',
  '24.02.2017',
  '31.03.2017',
  '28.04.2017'
];


//Nagroda specjalna: Opel Insignia
const PRIZES_SPECIAL = [
  '18.01.2016',
  '18.04.2016',
  '18.07.2016',
  '17.10.2016',
  '16.01.2017',
  '18.04.2017'
];


const groupByPrizes = function groupByPrizes(name, prizesList, date, collection) {
  logger.debug('groupByPrizes: ', name, date);

  const prizes = [];
  const winners = {};

  for (const i in collection) {
    if (collection.hasOwnProperty(i)) {
      const elem = collection[i];

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
    for (const prize in winners) {
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
    for (const j in prizesList) {
      if (prizesList.hasOwnProperty(j)) {
        prizes.push(new ResultPrizeResponseBuilder()
          .withName(prizesList[j])
          .withWinners([])
          .build()
        );
      }
    }
  }

  const status = Object.keys(winners).length ? ResultStatus.FINISHED : ResultStatus.ACTIVE;

  return new ResultResponseBuilder()
    .withName(name)
    .withDate(moment(date, 'DD.MM.YYYY').seconds(0).minutes(0).hours(21).toISOString())
    .withStatus(status)
    .withPrizes(prizes)
    .build();
};

const sortByDate = function sortByDate(one, two) {
  const a = moment(one.date);
  const b = moment(two.date);

  if (a.valueOf() < b.valueOf()) {
    return (two.status == one.status === ResultStatus.FINISHED) ? -1 : 1;
  }
  if (a.valueOf() > b.valueOf()) {
    return (two.status == one.status === ResultStatus.FINISHED) ? 1 : -1;
  }

  return 0;
};

const filterActive = function filterActive(results) {
  let activeCount = 0;
  return results.filter(result => {

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

const getLotteryResultsCollection = function getLotteryResultsCollection(options, callback) {

  return receiptsLotteryClient.getResults(options, (err, collection) => {
    if (err) {
      logger.error(err);
      return callback(err);
    }

    logger.debug('getLotteryResultsCollection.collection: ', collection);

    let results = [];
    let resultsLevel = [];

    PRIZES_I_LEVEL.map(date => {
      resultsLevel.push(groupByPrizes('Nagrody I stopnia', ['Opel Astra', 'iPad Air 2'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));
    resultsLevel = [];

    PRIZES_II_LEVEL.map(date => {
      resultsLevel.push(groupByPrizes('Nagrody II stopnia', ['Lenovo ThinkPad', 'iPad Air 2'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));
    resultsLevel = [];

    PRIZES_SPECIAL.map(date => {
      resultsLevel.push(groupByPrizes('Nagroda specjalna', ['Opel Insignia'], date, collection));
    });

    results = results.concat(filterActive(resultsLevel));

    return callback(err, results.sort(sortByDate));
  });

};

module.exports = {
  getLotteryResultsCollection: getLotteryResultsCollection
};