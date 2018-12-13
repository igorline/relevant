import { routerMiddleware } from 'react-router-redux';
import createSocketIoMiddleware from 'redux-socket.io';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { drizzleSagas } from 'drizzle';
import { all, fork } from 'redux-saga/effects';
import rootReducer from '../../reducers';

let server = process.env.API_SERVER;
if (process.env.NODE_ENV === 'development') {
  server = 'http://localhost:3000';
}
let socket;
let io;

if (process.env.BROWSER) {
  console.log('This is a browser, initialising socket io');
  io = require('socket.io-client');
  socket = io(server);

  socket.on('pingKeepAlive', () => {
    socket.emit('pingResponse');
  });
}

function* rootSaga() {
  yield all(drizzleSagas.map(saga => fork(saga)));
}

export default function configureStore(initialState = {}, history) {
  // Compose final middleware and use devtools in debug environment
  // let socketIoMiddleware = str => next => action => next(action);
  let middleware;

  const sagaMiddleware = createSagaMiddleware();

  if (process.env.BROWSER) {
    // only use the socket middleware on client and not on server
    const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');
    middleware = applyMiddleware(
      thunk,
      routerMiddleware(history),
      socketIoMiddleware,
      sagaMiddleware
    );
  } else {
    middleware = applyMiddleware(thunk, routerMiddleware(history), sagaMiddleware);
  }

  if (process.env.BROWSER && process.env.DEVTOOLS) {
    const devTools =
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
        ? window.devToolsExtension()
        : f => f;
    middleware = compose(
      middleware,
      devTools
    );
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
    module.hot.accept('../../reducers', () => {
      const nextRootReducer = require('../../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  sagaMiddleware.run(rootSaga);
  return store;
}
