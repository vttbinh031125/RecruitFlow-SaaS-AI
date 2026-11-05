module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      '<rootDir>/node_modules/next/dist/build/swc/jest-transformer.js',
      { isServer: true },
    ],
  },
};
