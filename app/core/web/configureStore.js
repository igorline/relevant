import createSocketIoMiddleware from 'redux-socket.io';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import { Map } from 'immutable';
// import { drizzleSagas } from 'drizzle';
// import { all, fork } from 'redux-saga/effects';
import { initProvider } from 'modules/web_ethTools/utils';
import rootReducer from '../reducers';
import rootSaga from '../sagas';

let server = process.env.API_SERVER;
if (process.env.NODE_ENV === 'development') {
  server = 'http://localhost:3000';
}
let socket;
let io;

if (process.env.BROWSER) {
  io = require('socket.io-client');
  socket = io(server);
  socket.on('pingKeepAlive', () => {
    socket.emit('pingResponse');
  });
}

const web3 = initProvider();

const _initialState = { RelevantToken: { contracts: Map() } };
export default function configureStore(initialState = _initialState) {
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
    if (process.env.BROWSER && process.env.DEVTOOLS) {
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
