import * as types from '../actions/actionTypes';

const initialState = {
  personal: [],
  count: false,
  loaded: false,
  general: []
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

    default:
      return state;
  }
}
