import * as types from '../actions/actionTypes';

const initialState = {};

export default function post(state = initialState, action) {
  switch (action.type) {
    case 'ADD_STATS': {
      return Object.assign({}, state, {
        [action.payload.user]: action.payload.data
      });
    }

    case 'SET_STATS': {
      state = action.payload;
      return state;
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
