import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Application from './app.container';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class AppContainer extends Component {
  render() {
    console.log('render app');
    return (
      <Provider store={store}>
        <Application />
      </Provider>
    );
  }
}
