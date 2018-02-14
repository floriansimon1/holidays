"use strict";

process.env.NODE_ENV = "test";

const axios    = require("axios");
const start    = require("./source/service");
const { port } = require("./source/configuration");

const base = `http://localhost:${port}/`;

let server;

describe("Holidays webservice test", function testWebservice() {
  beforeEach(startServer);
  afterEach(stopServer);

  it("should return a 400 for bad requests", async function testBadRequest() {
    return expect(get('/lux')).rejects.toHaveProperty('response.status', 400);
    return expect(get('/brank/lux')).rejects.toHaveProperty('response.status', 400);
  });

  it("should return a 404 for unknown countries", async function testUnknownCountry() {
    return expect(get('/luxambourg/2018')).rejects.toHaveProperty('response.status', 404);
  });

  it("should allow iso2, iso3 and full names for countries", async function testCountryAliases() {
    const a = JSON.stringify((await get('/luxembourg/2018')).data);
    const b = JSON.stringify((await get('/lux/2018')).data);
    const c = JSON.stringify((await get('/lu/2018')).data);

    expect(a).toBe(b);
    expect(a).toBe(c);
  });

  it("should be able to return a list of holidays", async function testHolidays() {
    const holidays = (await get('/luxembourg/2018')).data;

    expect(holidays).toHaveProperty("01-01");
    expect(holidays).toHaveProperty("04-02");
    expect(holidays).toHaveProperty("05-01");
    expect(holidays).toHaveProperty("05-10");
    expect(holidays).toHaveProperty("05-21");
    expect(holidays).toHaveProperty("06-23");
    expect(holidays).toHaveProperty("08-15");
    expect(holidays).toHaveProperty("11-01");
    expect(holidays).toHaveProperty("12-25");
    expect(holidays).toHaveProperty("12-26");

    expect(Object.keys(holidays).length).toBe(10);
  });

  it("should be able to return a list of holidays", async function testHolidays() {
    const holidays = (await get('/bank/luxembourg/2018')).data;

    expect(holidays).toHaveProperty("03-30");
    expect(holidays).toHaveProperty("12-24");

    expect(holidays["03-30"].afternoonOnly).toBe(false);
    expect(holidays["12-24"].afternoonOnly).toBe(true);

    expect(Object.keys(holidays).length).toBe(12);
  });

  it("should be able to test if a day is a holiday", async function testIsHoliday() {
    expect((await get('/luxembourg/2018-01-02')).data).toBe(false);
    expect((await get('/luxembourg/2018-01-01')).data).toBe(true);
    expect((await get('/luxembourg/2018-03-30')).data).toBe(false);
    expect((await get('/bank/luxembourg/2018-03-30')).data).toBe(true);
  });
});

function get(route) {
  return axios.get(`http://localhost:${port}${route}`);
}

async function startServer() {
  server = await start();
}

function stopServer() {
  return new Promise(function doStopServer(resolve, reject) {
    server.close(error => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });
}
