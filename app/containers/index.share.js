import React, { Component } from 'react'

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';
import ShareContainer from './share.container';

window.navigator.userAgent = "react-native";

const reducer = combineReducers(reducers);
let store = applyMiddleware(thunk)(createStore)(reducer);

export default class Share extends Component {
  render() {
    return (
      <Provider store={store}>
         <ShareContainer />
      </Provider>
    );
  }
}
