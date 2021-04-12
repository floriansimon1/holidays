"use strict";

const Countries = require("./countries");
const memoize   = require("lodash.memoize");
const luxon     = require("luxon");

const easter = Symbol.for("Easter");

const rules = {
  [Countries.luxembourg]: {
    references: [{ key: easter, calculate: calculateEasterDate }],

    holidays: [
      { day: "01-01", name: "Nouvel an"                                          },
      { day: "03-30", name: "Vendredi saint", bank: true                         },
      { name: "Lundi de Pâques", reference: easter, add: 1                       },
      { day: "05-01", name: "Fête du travail"                                    },
      { name: "Ascension", reference: easter, add: 39                            },
      { name: "Pentecôte", reference: easter, add: 50                            },
      { day: "06-23", name: "Fête nationale"                                     },
      { day: "08-15", name: "Assomption"                                         },
      { day: "11-01", name: "Toussaint"                                          },
      { day: "12-24", name: "Réveillon de Noël", bank: true, afternoonOnly: true },
      { day: "12-25", name: "Noël"                                               },
      { day: "12-26", name: "Saint Étienne"                                      }
    ]
  }
};

const Holidays = {
  isHoliday(withBankHolidays, country, date) {
    return Boolean(
      Holidays
      .getHolidays(withBankHolidays, country, String(date.year))
      [date.toFormat("LL-dd")]
    );
  },

  getHolidays: memoize(function getHolidays(withBankHolidays, country, year) {
    const { references, holidays } = rules[country];

    const computedReferences = references.reduce(function reduceReferences(reduced, { key, calculate }) {
      return Object.assign(reduced, { [key]: calculate(year) });
    }, {});

    return holidays.reduce(function computeHoliday(reduced, holiday) {
      const { day, name, reference, bank, afternoonOnly, add } = holiday;

      const formattedHoliday = {
        name,

        bank:          Boolean(bank),
        afternoonOnly: Boolean(afternoonOnly)
      };

      if (bank && !withBankHolidays) {
        return reduced;
      }

      if (day) {
        reduced[day] = formattedHoliday;
      } else {
        if (!computedReferences[reference]) {
          throw new Error(`Cannot find reference '${Symbol.keyFor(reference)}' for '${name}'`);
        }

        let computedDay = computedReferences[reference]
        .plus({ days: add })
        .toFormat("LL-dd");

        reduced[computedDay] = formattedHoliday;
      }

      return reduced;
    }, {});
  }, makeGetHolidaysMemoizeKey)
};

function makeGetHolidaysMemoizeKey(bank, country, year) {
  return `${bank} ${Symbol.keyFor(country)} ${year}`;
}

// See https://github.com/kodie/moment-holiday/blob/master/locale/easter.js
function calculateEasterDate(yearString) {
  const year = parseInt(yearString);

  const c = Math.floor(year / 100);

  const n = year - 19 * Math.floor(year / 19);
  const k = Math.floor((c - 17) / 25);

  let i = c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;

  i -= 30 * Math.floor((i / 30));

  i -= Math.floor(i / 28) * (1 - Math.floor(i / 28) * Math.floor(29 / (i + 1)) * Math.floor((21 - n) / 11));

  let j = year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4);

  j -= 7 * Math.floor(j / 7);

  const l = i - j;

  const month = 3 + Math.floor((l + 40) / 44);

  const day = l + 28 - 31 * Math.floor(month / 4);

  return luxon.DateTime.fromObject({ day, month, year });
}

module.exports = Holidays;
