import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import configureStore from 'app/core/mobile/configureStore';
import Application from './app.container';

const store = configureStore();
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

class AppContainer extends Component {
  render() {
    return (
      <Provider store={store}>
        <Application />
      </Provider>
    );
  }
}

export default codePush(codePushOptions)(AppContainer);