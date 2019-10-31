// This is needed for android
// may not be needed in future versions
// https://github.com/facebook/react-native/issues/20902

// require('@babel/polyfill');
global.Buffer = global.Buffer || require('buffer').Buffer;
require('react-native-gesture-handler');

const { AppRegistry } = require('react-native');
const App = require('./app/modules/_app/mobile/app.index').default;
const Share = require('./app/modules/_app/mobile/share.index').default;

AppRegistry.registerComponent('relevantNative', () => App);
AppRegistry.registerComponent('Relevant', () => Share);
