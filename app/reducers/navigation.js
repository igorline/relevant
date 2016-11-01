import { NavigationExperimental } from 'react-native';
import { PUSH_ROUTE, POP_ROUTE } from '../actions/actionTypes';

const {
 StateUtils: NavigationStateUtils
} = NavigationExperimental;

const initialState = {
  index: 0,
  key: 'default',
  routes: [
    {
      key: 'default',
      title: 'Auth'
    }
  ]
};

function navigationState(state = initialState, action) {
  switch (action.type) {
    case PUSH_ROUTE:
      console.log("PUSH ", action.route);
      if (state.routes[state.index].key === (action.route && action.route.key)) return state;
      return NavigationStateUtils.push(state, action.route);
    case "POP_ROUTE":
      console.log("POP ", state);
      if (state.index === 0 || state.routes.length === 1) return state;
      return NavigationStateUtils.pop(state);
    default:
      return state;
  }
}

export default navigationState;
