import * as types from 'core/actionTypes';

const initialState = {};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_ANIMATION: {
      const { type } = action.payload;
      const index = state[type] ? state[type].index + 1 : 0;
      return {
        ...state,
        currentType: type,
        [type]: {
          index,
          ...action.payload.data
        }
      };
    }
    default:
      return state;
  }
}
