require('./app/publicenv.js');

process.env.WEB = 'true';
process.env.BROWSER = 'true';

module.exports = {
  // setupFiles: ['<rootDir>/.jest/register-context.js'],
  // setupTestFrameworkScriptFile: '<rootDir>/jest.setup.js',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  // for some reason testing without this causes a 'canvas' error when using react-native-web
  preset: 'react-native-web',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': './node_modules/babel-jest',
    '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|png|psd|svg|webp)$': '<rootDir>/__mocks__/fileTransformer.js'
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  setupFiles: ['jest-canvas-mock']
};

