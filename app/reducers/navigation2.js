import { NavigationExperimental } from 'react-native';
import { PUSH_ROUTE, POP_ROUTE, CHANGE_TAB } from '../actions/actionTypes';

const {
 StateUtils: NavigationStateUtils
} = NavigationExperimental;

const initialState = {
  tabs: {
    index: 0,
    key: 'root',
    routes: [
      { key: 'auth', icon:'', title: 'Auth', hide: false },
      { key: 'read', icon: '📩', title: 'Read' },
      { key: 'discover', icon: '🔮', title: 'Discover' },
      { key: 'createPost', icon: '📝', title: 'Create Post' },
      { key: 'activity', icon: '⚡', title: 'Activity' },
      { key: 'myProfile', icon: '👤', title: 'Profile' }
    ],
  },
  auth: {
    index: 0,
    key: 'auth',
    routes: [{
      key: 'auth',
      title: 'Auth'
    }],
  },
  read: {
    index: 0,
    key: 'read',
    routes: [{
      key: 'read',
      title: 'read'
    }],
  },
  discover: {
    index: 0,
    key: 'read',
    routes: [{
      key: 'discover',
      title: 'Discover'
    }],
  },
  createPost: {
    index: 0,
    key: 'createPost',
    routes: [{
      key: 'createPost',
      title: 'Create Post'
    }],
  },
  activity: {
    index: 0,
    key: 'activity',
    routes: [{
      key: 'activity',
      title: 'Activity'
    }],
  },
  myProfile: {
    index: 0,
    key: 'myProfile',
    routes: [{
      key: 'myProfile',
      title: 'Profile'
    }],
  },
};

function navigationState(state = initialState, action) {
    switch (action.type) {
        // push to tab scene stack
        case PUSH_ROUTE: {

            const activeTabIndex  = state.tabs.index;
            const activeTabKey    = state.tabs.routes[activeTabIndex].key
            const scenes          = {
                ...state[activeTabKey],
                animation: action.animation,
            }
            const nextScenes      = NavigationStateUtils.push(scenes, action.route);

            if (scenes !== nextScenes) {
                return {
                   ...state,
                   [activeTabKey]: nextScenes,
                };
            }
            break;
        }

        // pop from tab scene stack
        case POP_ROUTE: {
            console.log("pop ", state.tabs.routes[state.tabs.index].key);
            let key = action.tabKey || state.tabs.routes[state.tabs.index].key;
            const scenes     = state[key];
            const nextScenes = NavigationStateUtils.pop(scenes);

            if (scenes !== nextScenes) {
                return {
                   ...state,
                   [key]: nextScenes,
                };
            }
            else return state;
            break;
        }

        // case ACTIONS.RESET_ROUTES: {
        //     const prevScenes        = {
        //         ...state[action.tabKey],
        //         animation: 'reset',
        //     }
        //     const nextChildren = prevScenes.routes.slice(0, 1);
        //     const nextIndex    = 0;
        //     const nextScenes   = NavigationStateUtils.reset(prevScenes, nextChildren, nextIndex);

        //     return {
        //        ...state,
        //        [action.tabKey]: nextScenes,
        //     };

        //     break;
        // }

        // navigate to a new tab stack
        case CHANGE_TAB: {
            const nextTabs = NavigationStateUtils.jumpToIndex(state.tabs, action.tabKey);

            if (nextTabs !== state.tabs) {
                return {
                    ...state,
                    tabs: nextTabs,
                }
            }
            return state;
        }

        // case ACTIONS.TOGGLE_MODAL: {
        //     return {
        //         ...state,
        //         modal: {
        //             ...state.modal,
        //             isModalActive: !state.modal.isModalActive,
        //             modalKey: action.modalKey,
        //             modalViewStyle: action.modalViewStyle,
        //         }
        //     }
        // }

        default:
            return state;
    }
}

export default navigationState;
