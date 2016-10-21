import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Application from './app.containerNew';
import configureStore from '../store/configureStore';


const store = configureStore();

export default class AppContainer extends Component {
  render() {
    return (
      <Provider store={store}>
         <Application />
      </Provider>
    );
  }
}