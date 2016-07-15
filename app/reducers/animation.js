import * as types from '../actions/actionTypes';

const initialState = {bool: false, type: null};
const REPLACE = 'REPLACE';


export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_ANIMATION: {
      return Object.assign({}, state, {
        'type': action.payload.type,
        'bool': true,
      })
    }

    case types.CLEAR_ANIMATION: {
      return Object.assign({}, state, {
        'type': null,
        'bool': false,
      })
    }

    default:
      return state
  }
};
