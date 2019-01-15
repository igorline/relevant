import {
  REFRESH_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  TOGGLE_TOPICS,
  SCROLL
} from 'core/actionTypes';

const initialState = {
  showTopics: false,
  reload: 0,
  scroll: false,
  discover: {},
  stats: {},
  createPost: {},
  activity: {},
  profile: {},
  myProfile: {}
};

function navigationState(state = initialState, action) {
  switch (action.type) {
    case SCROLL: {
      return {
        ...state,
        scroll: action.payload
      };
    }

    case TOGGLE_TOPICS: {
      return {
        ...state,
        showTopics: action.payload !== undefined ? action.payload : !state.showTopics
      };
    }

    case REFRESH_ROUTE: {
      const { key } = action;
      return {
        ...state,
        [key]: {
          ...state[key],
          refresh: new Date().getTime()
        }
      };
    }

    case RELOAD_ROUTE: {
      const { key } = action;
      return {
        ...state,
        [key]: {
          ...state[key],
          reload: new Date().getTime()
        }
      };
    }

    case RELOAD_ALL_TABS: {
      return {
        ...state,
        reload: new Date().getTime()
      };
    }

    default:
      return state;
  }
}

export default navigationState;
