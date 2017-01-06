import * as types from '../actions/actionTypes';

const initialState = {
  invest: 0,
  irrelevant: 0,
};

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_ANIMATION: {
      let type = action.payload.type;
      return {
        ...state,
        [type]: state[type] + 1
      };
    }
    default:
      return state;
  }
}

