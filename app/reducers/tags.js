import * as types from '../actions/actionTypes';

const initialState = {
  tags: []
};

export default function tag(state = initialState, action) {
  switch (action.type) {

    case types.SET_DISCOVER_TAGS: {
      return Object.assign({}, state, {
        tags: action.payload,
      });
    }

    default: return state;
  }
}
