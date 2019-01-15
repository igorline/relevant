import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createSocketIoMiddleware from 'redux-socket.io';
import rootReducer from 'core/reducers';

window.navigator.userAgent = 'react-native';
const io = require('socket.io-client/dist/socket.io');

const socket = io(process.env.API_SERVER, {
  transports: ['websocket'],
  jsonp: false
});

socket.on('pingKeepAlive', () => {
  socket.emit('pingResponse');
});

socket.on('reconnect_attempt', () => {
  socket.io.opts.transports = ['polling', 'websocket'];
});

let store;

export default function configureStore() {
  const socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

  store = applyMiddleware(thunk, socketIoMiddleware)(createStore)(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  socket.on('connect', () => {
    const s = store.getState();
    if (s.auth && s.auth.user) {
      socket.emit('action', {
        type: 'server/storeUser',
        payload: s.auth.user._id
      });
    }
  });

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('core/reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}

exports.STORE = store;
