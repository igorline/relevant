module.exports = {
  testPathIgnorePatterns: ['<rootDir>/../node_modules/'],
  globalSetup: '<rootDir>/.jest/setup',
  globalTeardown: '<rootDir>/.jest/teardown',
  testEnvironment: '<rootDir>/.jest/mongo.environment',
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/../node_modules/babel-jest',
    '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|png|psd|svg|webp)$':
      '<rootDir>/../__mocks__/fileTransformer.js'
  },
  setupTestFrameworkScriptFile: '<rootDir>/.jest/testDbSetup'
};
