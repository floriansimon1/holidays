const { Optional } = require("lonad");

const luxembourg = Symbol.for('luxembourg');

const iso2         = { lu:  luxembourg };
const iso3         = { lux: luxembourg };
const licensePlate = { l:   luxembourg };

const countries = new Set([luxembourg]);

module.exports = {
  luxembourg,

  parseCountry(identifier) {
    const asSymbol = Symbol.for(identifier);

    return Optional
    .Some(
      iso2[identifier]
      || iso3[identifier]
      || licensePlate[identifier]
      || asSymbol
    )
    .filter(countries.has.bind(countries));
  }
}
