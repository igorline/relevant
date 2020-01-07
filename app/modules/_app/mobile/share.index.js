import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import configureStore from 'app/core/mobile/configureShareStore';
import { client } from 'app/core/apollo.client';
import { ApolloProvider } from '@apollo/react-hooks';
import ShareContainer from './share.container';

const store = configureStore();
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

class Share extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <ShareContainer />
        </Provider>
      </ApolloProvider>
    );
  }
}

export default codePush(codePushOptions)(Share);
