import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createSocketIoMiddleware from 'redux-socket.io';
import rootReducer from '../reducers';

window.navigator.userAgent = 'react-native';
const io = require('socket.io-client/socket.io');

require('../publicenv');

let socket = io(process.env.API_SERVER, {
  transports: ['websocket'],
  jsonp: false
});

socket.on('pingKeepAlive', () => {
  socket.emit('pingResponse');
});

export default function configureStore() {
  let socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

  let store = applyMiddleware(thunk, socketIoMiddleware)(createStore)(rootReducer);

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
