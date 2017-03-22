import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

window.navigator.userAgent = 'react-native';

// require('../publicenv');

export default function configureStore() {

  let store = applyMiddleware(thunk)(createStore)(rootReducer);

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
