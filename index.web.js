import '@babel/polyfill';
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import { hydrate } from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'modules/navigation/history';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import debug from 'debug';
import configureStore from 'core/web/configureStore';
import routes from 'modules/_app/web/routes';
import { loadableReady } from '@loadable/component';

const clientDebug = debug('app:client');
const rootElement = document.getElementById('app');

window.React = React; // For chrome dev tool support

if (process.env.NODE_ENV === 'development') {
  window.reduxDebug = debug;
  window.reduxDebug.enable('*'); // this should be activated only on development env
}

const initialState = window.__INITIAL_STATE__ || undefined;

const store = configureStore(initialState);

clientDebug('rehydrating app');
if (localStorage) localStorage.debug = '';

const renderApp = appRoutes => {
  hydrate(
    <AppContainer>
      <Provider store={store}>
        <Router history={history}>{renderRoutes(appRoutes)}</Router>
      </Provider>
    </AppContainer>
    , rootElement
  );
};

loadableReady(() => {
  renderApp(routes);
});

if (module.hot) {
  module.hot.accept('./app/modules/_app/web/routes', () => {
    const newRoutes = require('./app/modules/_app/web/routes').default;
    renderApp(newRoutes);
  });
}
