const luxon        = require("luxon");
const { Optional } = require("lonad");

const Dates = {
  parseYear(input) {
    const asLuxon = luxon.DateTime.fromFormat(input, "yyyy");

    return Optional
    .when(asLuxon.isValid, asLuxon.year)
    .map(String);
  },

  parseDate(input) {
    const asLuxon = luxon.DateTime.fromFormat(input, "yyyy-LL-dd");

    return Optional.when(asLuxon.isValid, asLuxon);
  }
};

module.exports = Dates;
