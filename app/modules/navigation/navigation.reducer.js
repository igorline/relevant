import {
  REFRESH_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  TOGGLE_TOPICS,
  SCROLL,
  SHOW_MODAL,
  HIDE_MODAL
} from 'core/actionTypes';

const initialState = {
  showTopics: false,
  reload: 0,
  scroll: false,
  discover: {},
  stats: {},
  wallet: {},
  createPost: {},
  activity: {},
  profile: {},
  myProfile: {},
  modal: null
};

function navigationState(state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL: {
      return {
        ...state,
        modal: action.payload
      };
    }

    case HIDE_MODAL: {
      return {
        ...state,
        modal: null
      };
    }

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
