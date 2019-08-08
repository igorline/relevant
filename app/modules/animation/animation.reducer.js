import * as types from 'core/actionTypes';

const initialState = {
  invest: 0,
  downvote: 0,
  amount: {},
  upvote: 0,
  parents: {}
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_ANIMATION: {
      const { type } = action.payload;
      return {
        ...state,
        amount: {
          ...state.amount,
          [type]: action.payload.amount
        },
        parents: {
          ...state.parents,
          [type]: action.payload.parent
        },
        [type]: state[type] + 1
      };
    }

    default:
      return state;
  }
}
