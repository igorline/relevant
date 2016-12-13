import { AppRegistry } from 'react-native';
import App from './app/containers';
import Share from './app/containers/index.share';

AppRegistry.registerComponent('relevantNative', () => App);
AppRegistry.registerComponent('Relevant', () => Share);
