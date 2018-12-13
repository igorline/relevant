import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
// import createHistory from 'history/lib/createBrowserHistory';
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

const initialState = window.__INITIAL_STATE__ || undefined;
const store = configureStore(initialState, browserHistory);
const history = syncHistoryWithStore(browserHistory, store);

clientDebug('rehydrating app');
if (localStorage) localStorage.debug = '';

render(
  <Provider store={store}>
    <div className="parent">
      <Router routes={routes(store)} history={history}/>
    </div>
  </Provider>,
  rootElement
);
