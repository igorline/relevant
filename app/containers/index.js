import React, { Component } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';
import Application from './app.container';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client/socket.io';

let socket = io('http://localhost:3000', {
  transports: ['websocket']
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