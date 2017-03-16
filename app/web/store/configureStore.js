import { routerMiddleware } from 'react-router-redux';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../../reducers';

let socket = io('http://localhost:3000');

export default function configureStore (initialState = {}, history) {
  // Compose final middleware and use devtools in debug environment
  let socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');
  let middleware = applyMiddleware(
    thunk, routerMiddleware(history), socketIoMiddleware);
  if (process.env.BROWSER && process.env.DEVTOOLS) {
    const devTools = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    middleware = compose(middleware, devTools);
  }
  // Create final store and subscribe router in debug env ie. for devtools
  const store = middleware(createStore)(rootReducer, initialState);

  if (module.hot) {
    module.hot.accept('../../reducers', () => {
      const nextRootReducer = require('../../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
