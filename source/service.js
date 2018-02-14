"use strict";

const nodeHttp       = require("http");
const { Optional }   = require("lonad");
const { pipe }       = require("ramda");
const http           = require("./http");
const Dates          = require("./dates");
const Holidays       = require("./holidays");
const Countries      = require("./countries");
const spread         = require("lodash.spread");
const configuration  = require('./configuration');

module.exports = function start() {
  return new Promise(function startServer(resolve, reject) {
    const server = nodeHttp.createServer(http.failsafe(processRequests));

    server.on('error', reject);
    server.on('listening', resolve.bind(null, server));

    server.listen(configuration.port);
  });
}

function processRequests(request, response) {
  const url = request.url || '';

  const bank = Boolean(url.match(/^\/bank\//));

  const getHolidaysRouteMatch = Optional.fromNullable(url.match(/\/(\w+)\/([1-2]\d{3})\/?$/));
  const isHolidayRouteMatch   = Optional.fromNullable(url.match(/\/(\w+)\/(\d{4}-\d{2}-\d{2})\/?$/));

  const country = getHolidaysRouteMatch
  .or(isHolidayRouteMatch)
  .property("1")
  .flatMap(Countries.parseCountry);

  const getHolidaysResponse = getHolidaysRouteMatch.flatMap(processGetHolidaysQuery(response, country, bank));
  const isHolidaysResponse  = isHolidayRouteMatch.flatMap(processIsHolidayQuery(response, country, bank));

  getHolidaysResponse
  .or(isHolidaysResponse)
  .or(() => http.sendBadRequest(response));
}

function processGetHolidaysQuery(response, country, bank) {
  return function getHolidays(match) {
    return Optional
    .all([Optional.Some(bank), country, Dates.parseYear(match[2])])
    .map(spread(Holidays.getHolidays))
    .map(http.sendJson(response))
    .recover(() => http.sendNotFound(response));
  };
}

function processIsHolidayQuery(response, country, bank) {
  return function isHoliday(match) {
    return Optional
    .all([Optional.Some(bank), country, Dates.parseDate(match[2])])
    .map(spread(Holidays.isHoliday))
    .map(http.sendJson(response))
    .recover(() => http.sendNotFound(response));
  };
}
