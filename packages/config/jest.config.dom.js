const base = require('./jest.config.base.js');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  testEnvironment: 'jsdom',
};

module.exports = config;
