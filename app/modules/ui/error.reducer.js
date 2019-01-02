import * as types from 'core/actionTypes';

const initialState = {
  universal: false,
  discover: false,
  read: false,
  profile: false,
  activity: false,
  singlepost: false,
  comments: false,
  stats: false
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case 'SET_ERROR': {
      return {
        ...state,
        [action.payload.type]: action.payload.bool
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
