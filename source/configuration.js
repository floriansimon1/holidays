const environment = process.env.NODE_ENV || 'development';

const configurations = {
  development: { port: 16000 },
  docker:      { port: 80    },
  test:        { port: 16002 }
};

module.exports = configurations[environment];
