import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';
import Application from './app.container';
window.navigator.userAgent = "react-native";
var io = require('socket.io-client/socket.io');
import createSocketIoMiddleware from 'redux-socket.io';
require('../publicenv');
let socket = io(process.env.API_SERVER, {
  transports: ['websocket'],
  jsonp: false
});
let socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

const reducer = combineReducers(reducers);
let store = applyMiddleware(thunk, socketIoMiddleware)(createStore)(reducer);


export default class AppContainer extends Component {

  render() {
    return (
      <Provider store={store}>
         <Application />
      </Provider>
    );
  }
}