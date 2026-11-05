module.exports = {
  ...require('./jest.config.cjs'),
  testMatch: ['**/test/**/*.integration.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 90000,
};
