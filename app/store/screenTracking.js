import * as types from '../actions/actionTypes';
import Analytics from 'react-native-firebase-analytics';

// gets the current screen from navigation state
function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.component || route.key;
}


const screenTracking = ({ getState }) => next => (action) => {
  if (
    action.type !== types.PUSH_ROUTE
    && action.type !== types.POP_ROUTE
    && action.type !== types.RESET_ROUTES
    && action.type !== types.REPLACE_ROUTE
    && action.type !== types.CHANGE_TAB
  ) {
    return next(action);
  }
  let oldState = getState();
  let nav = oldState.navigation;
  let view = nav.currentView;
  let route = nav[view];
  const currentScreen = getCurrentRouteName(route);
  const result = next(action);

  let newState = getState();
  nav = newState.navigation;
  view = nav.currentView;
  route = nav[view];
  const nextScreen = getCurrentRouteName(route);

  if (nextScreen !== currentScreen) {
    // the line below uses the Google Analytics tracker
    // change the tracker here to use other Mobile analytics SDK.
    Analytics.logEvent('screenView', {
      viewName: nextScreen
    });
  }
  return result;
};

export default screenTracking;
