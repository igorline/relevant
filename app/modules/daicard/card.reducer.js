import * as types from 'core/actionTypes';

const initialState = {
  connextState: {},
  browserMinimumBalance: null
};

export default function post(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_CONNEXT_STATE: {
      return {
        ...state,
        ...action.payload
      };
    }

    default:
      return state;
  }
}
