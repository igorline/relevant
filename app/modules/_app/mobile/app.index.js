import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import configureStore from 'app/core/mobile/configureStore';
import { ApolloProvider } from '@apollo/react-hooks';
import { client } from 'app/core/apollo.client';
import DrawerRouter from './drawerRouter';

const store = configureStore();
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <DrawerRouter />
        </Provider>
      </ApolloProvider>
    );
  }
}

export default codePush(codePushOptions)(App);
