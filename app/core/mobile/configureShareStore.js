import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'core/reducers';

window.navigator.userAgent = 'react-native';

export default function configureStore() {
  const store = applyMiddleware(thunk)(createStore)(
    rootReducer
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('core/reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
