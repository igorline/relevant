import React, { Component } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';
import Application from './app';

const reducer = combineReducers(reducers);
let store = applyMiddleware(thunk)(createStore)(reducer);
// let store = createStore(combineReducers(reducers));

export default class AppContainer extends Component {
  render() {
    return (
      <Provider store={store}>
         <Application />
      </Provider>
    );
  }
}