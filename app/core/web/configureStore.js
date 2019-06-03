import createSocketIoMiddleware from 'redux-socket.io';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
// import { drizzleSagas } from 'drizzle';
import { getProvider, getMetamask, getRpcUrl } from 'modules/web_ethTools/utils';
import rootReducer from '../reducers';
import rootSaga from '../sagas';
import { collapseActions, stateTransformer } from '../storeUtils';

let server = process.env.API_SERVER;
if (process.env.NODE_ENV === 'development') {
  server = 'http://localhost:3000';
}
let socket;
let io;
let web3;
let createLogger;

if (process.env.BROWSER) {
  io = require('socket.io-client');
  socket = io(server);
  socket.on('pingKeepAlive', () => {
    socket.emit('pingResponse');
  });
  web3 = getProvider({
    _rpcUrl: getRpcUrl(),
    metamask: getMetamask()
  });
  if (process.env.DEVTOOLS) {
    createLogger = require('redux-logger').createLogger;
  }
} else web3 = getProvider({ _rpcUrl: getRpcUrl() });

export default function configureStore(initialState = {}) {
  // Compose final middleware and use devtools in debug environment
  let middleware;

  const sagaMiddleware = createSagaMiddleware({
    context: {
      web3
    }
  });

  if (process.env.BROWSER) {
    // only use the socket middleware on client and not on server
    const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');
    const _middleware = [thunk, socketIoMiddleware, sagaMiddleware];
    if (process.env.DEVTOOLS) {
      const logger = createLogger({
        collapsed: (getState, action) => collapseActions[action.type],
        stateTransformer
      });
      _middleware.push(logger);
    }
    middleware = applyMiddleware(..._middleware);
  } else {
    middleware = applyMiddleware(thunk, sagaMiddleware);
  }

  if (process.env.BROWSER && process.env.DEVTOOLS) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    middleware = composeEnhancers(middleware);
  }
  // Create final store and subscribe router in debug env ie. for devtools
  const store = middleware(createStore)(rootReducer, initialState);

  if (process.env.BROWSER) {
    socket.on('connect', () => {
      const state = store.getState();
      if (state.auth && state.auth.user) {
        socket.emit('action', {
          type: 'server/storeUser',
          payload: state.auth.user._id
        });
      }
    });
  }

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  sagaMiddleware.run(rootSaga);
  return store;
}
