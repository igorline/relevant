import { AppRegistry } from 'react-native';
import App from './app/containers';
import Share from './app/containers/index.share';

// AppRegistry.registerComponent('relevantNative', () => require('./app/containers/index').default);
// AppRegistry.registerComponent('Relevant', () => require('./app/containers/index.share').default);
AppRegistry.registerComponent('relevantNative', () => App);
AppRegistry.registerComponent('Relevant', () => Share);
