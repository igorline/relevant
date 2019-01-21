// TODO - move this stuff to setup file?
require('./app/publicenv.js');

process.env.WEB = 'true';
process.env.BROWSER = 'true';

module.exports = {
  // setupFiles: ['<rootDir>/.jest/register-context.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  preset: 'react-native-web',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': './node_modules/babel-jest',
    '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|png|psd|svg|webp)$': '<rootDir>/__mocks__/fileTransformer.js'
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  // for some react-native-web aliasing is causing a
  // console / 'canvas' error - this mocks canvas as a solution
  setupFiles: ['jest-canvas-mock']
};

