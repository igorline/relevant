import 'babel-polyfill';
import { Router, browserHistory } from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import debug from 'debug';
import configureStore from './app/web/store/configureStore';

const clientDebug = debug('app:client');
const rootElement = document.getElementById('app');
const routes = require('./app/web/routes');

window.React = React; // For chrome dev tool support

if (process.env.NODE_ENV === 'development') {
  window.reduxDebug = debug;
  window.reduxDebug.enable('*'); // this should be activated only on development env
}

let initialState = window.__INITIAL_STATE__ || undefined;

const store = configureStore(initialState, browserHistory);

clientDebug('rehydrating app');
if (localStorage) localStorage.debug = '';

ReactDOM.render(
  <Provider store={store}>
    <div className="parent">
      <Router routes={routes(store)} history={browserHistory} />
    </div>
  </Provider>,
  rootElement
);
