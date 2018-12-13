import 'babel-polyfill';
import { AppContainer } from 'react-hot-loader';
import { Router, browserHistory } from 'react-router';
import React from 'react';
import { hydrate } from 'react-dom';
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

const initialState = window.__INITIAL_STATE__ || undefined;

const store = configureStore(initialState, browserHistory);

clientDebug('rehydrating app');
if (localStorage) localStorage.debug = '';

const renderApp = appRoutes => {
  hydrate(
    <AppContainer>
      <Provider store={store}>
        <div className="parent">
          <Router
            routes={appRoutes(store)}
            history={browserHistory}
          />
        </div>
      </Provider>
    </AppContainer>,
    rootElement
  );
};

renderApp(routes);

if (module.hot) {
  module.hot.accept('./app/web/routes', () => {
    const newRoutes = require('./app/web/routes');
    renderApp(newRoutes);
  });
}
