// This is needed for android
// may not be needed in future versions
// https://github.com/facebook/react-native/issues/20902
import '@babel/polyfill';

import { AppRegistry } from 'react-native';
import App from './app/modules/_app/mobile/app.index';
import Share from './app/modules/_app/mobile/share.index';

AppRegistry.registerComponent('relevantNative', () => App);
AppRegistry.registerComponent('Relevant', () => Share);
