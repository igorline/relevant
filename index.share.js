require('@babel/polyfill');

const { AppRegistry } = require('react-native');
const Share = require('./app/modules/_app/mobile/share.index').default;

AppRegistry.registerComponent('Relevant', () => Share);

// import { AppRegistry } from 'react-native';
// // import App from './app/containers';
// // import Share from './app/containers/index.share';

// // AppRegistry.registerComponent('relevantNative',
// // () => require('./app/containers/index.share').default);
// AppRegistry.registerComponent('Relevant', () => require('./app/modules/_app/mobile/share.index').default);
