import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import ShareContainer from './share.container';
import configureStore from '../store/configureShareStore';

const store = configureStore();
let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

class Share extends Component {
  render() {
    return (
      <Provider store={store}>
        <ShareContainer />
      </Provider>
    );
  }
}

export default codePush(codePushOptions)(Share);
