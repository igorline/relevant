import { AppRegistry } from 'react-native';
import App from './app/modules/_app/mobile/app.index';
import Share from './app/modules/_app/mobile/share.index';

// AppRegistry.registerComponent('relevantNative', () => require('./app/containers/index').default);
// AppRegistry.registerComponent('Relevant', () => require('./app/containers/index.share').default);
AppRegistry.registerComponent('relevantNative', () => App);
AppRegistry.registerComponent('Relevant', () => Share);
