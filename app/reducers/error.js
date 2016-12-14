import * as types from '../actions/actionTypes';

const initialState = { universal: false, discover: false, read: false, profile: false, activity: false, singlepost: false, comments: false };

export default function auth(state = initialState, action) {
  switch (action.type) {

    case 'SET_ERROR': {
      return Object.assign({}, state, {
        [action.payload.type]: action.payload.bool
      });
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
};
