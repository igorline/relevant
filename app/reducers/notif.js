import * as types from '../actions/actionTypes';

const initialState = {
  personal: [],
  count: false,
  loaded: false,
  general: []
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_ACTIVITY: {
      const type = action.payload.type;
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

    // case types.ADD_UNREAD_ACTIVITIES: {
    //   return {
    //     ...state,
    //     count: action.payload
    //   };
    // }

    // case 'RESET_ACTIVITY': {
    //   return Object.assign({}, state, {
    //     'personal': action.payload,
    //     'count': countUnread(action.payload)
    //   })
    // }

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

    // case 'SET_GENERAL_ACTIVITY': {
    //   return Object.assign({}, state, {
    //     'general': addItems(state.general, action.payload),
    //   })
    // }

    // case 'ADD_GENERAL_ACTIVITY': {
    //   return Object.assign({}, state, {
    //     'general': addItems(state.general, [action.payload]),
    //   })
    // }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
