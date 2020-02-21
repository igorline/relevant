import {
  REFRESH_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS,
  TOGGLE_TOPICS,
  SCROLL,
  SHOW_MODAL,
  HIDE_MODAL,
  OPEN_WEB_SIDE_NAV,
  CLOSE_WEB_SIDE_NAV,
  SET_WIDTH,
  LOCK_DRAWER,
  SET_SCROLL_TAB,
  REGISTER_GESTURE
} from 'core/actionTypes';

export const initialState = {
  showTopics: false,
  reload: 0,
  scroll: false,
  gesture: null,
  discover: {},
  stats: {},
  wallet: {},
  createPost: {},
  activity: {},
  profile: {},
  myProfile: {},
  modal: null,
  sideNavIsOpen: false,
  width: null,
  screenSize: 0,
  modalData: null,
  lockDrawer: false
};

function navigationState(state = initialState, action) {
  switch (action.type) {
    case SET_WIDTH:
      return {
        ...state,
        width: action.payload.width,
        screenSize: action.payload.screenSize
      };
    case OPEN_WEB_SIDE_NAV:
      return {
        ...state,
        sideNavIsOpen: true
      };

    case CLOSE_WEB_SIDE_NAV:
      return {
        ...state,
        sideNavIsOpen: false
      };

    case SHOW_MODAL: {
      return {
        ...state,
        modal: action.payload.modal,
        modalData: action.payload.data
      };
    }

    case SET_SCROLL_TAB: {
      switch (action.payload.type) {
        case 'discover':
          return {
            ...state,
            discover: {
              ...state.discover,
              ...action.payload.view
            }
          };
        default:
          return state;
      }
    }

    case HIDE_MODAL: {
      return {
        ...state,
        modal: null,
        modalData: null
      };
    }

    case SCROLL: {
      return {
        ...state,
        scroll: action.payload
      };
    }

    case LOCK_DRAWER: {
      return {
        ...state,
        lockDrawer: action.payload
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

    case REGISTER_GESTURE: {
      return {
        ...state,
        gesture: action.payload
      };
    }

    default:
      return state;
  }
}

export default navigationState;
