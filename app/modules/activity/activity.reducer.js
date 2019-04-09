import * as types from 'core/actionTypes';

const initialState = {
  personal: [],
  count: false,
  loaded: false,
  general: [],
  notification: null,
  notificationProps: {}
};

export default function notifications(state = initialState, action) {
  switch (action.type) {
    case types.SET_ACTIVITY: {
      const { type } = action.payload;
      return {
        ...state,
        [type]: [...state[type].slice(0, action.payload.index), ...action.payload.data],
        loaded: true
      };
    }

    case types.SET_COUNT: {
      return {
        ...state,
        count: action.payload
      };
    }

    case 'CLEAR_COUNT': {
      return {
        ...state,
        count: null
      };
    }

    case 'ADD_ACTIVITY': {
      return {
        ...state,
        count: state.count + 1
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    case types.SHOW_NOTIFICATION: {
      return {
        ...state,
        notification: action.payload.notification,
        notificationProps: action.payload.notificationProps
      };
    }

    case types.HIDE_NOTIFICATION: {
      return {
        ...state,
        notification: null,
        notifcationProps: {}
      };
    }

    default:
      return state;
  }
}
