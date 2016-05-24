import * as types from '../actions/actionTypes';

const initialState = {index: null};
const REPLACE = 'REPLACE';

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_MESSAGES: {
      return Object.assign({}, state, {
        'index': action.payload,
      })
    }

    default:
      return state
  }
};
