import * as types from '../actions/actionTypes';

const initialState = {
  invest: 0,
  irrelevant: 0,
  amount: {},
  upvote: 0,
  parents: {}
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_ANIMATION: {
      let type = action.payload.type;
      return {
        ...state,
        [type]: state[type] + 1,
        amount: {
          ...state.amount,
          [type]: action.payload.amount,
        },
        parents: {
          ...state.parents,
          [type]: action.payload.parent
        }
      };
    }

    default:
      return state;
  }
}

