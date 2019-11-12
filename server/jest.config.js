module.exports = {
  rootDir: './',
  displayName: 'Server',
  globalSetup: '<rootDir>/test/setup',
  globalTeardown: '<rootDir>/test/teardown',
  testEnvironment: '<rootDir>/test/mongo.environment',
  transform: {
    '^.+\\.(js|jsx|model)$': '<rootDir>/../node_modules/babel-jest',
    '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|png|psd|svg|webp)$':
      '<rootDir>/../__mocks__/fileTransformer.js'
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  setupFilesAfterEnv: ['<rootDir>/test/testDbSetup'],
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: [
    '<rootDir>/../node_modules/'
    // 'ethereum.test.js'
    // 'cashout.test.js'
  ]
};
