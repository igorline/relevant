import * as types from '../actions/actionTypes';

const initialState = { bool: false, type: null, run: false };
const REPLACE = 'REPLACE';


export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_ANIMATION: {
      let type = null;
      if (action.payload) {
        if (action.payload.type) type = action.payload.type;
      }
      return Object.assign({}, state, {
        type,
        'bool': true,
        'run': true
      })
    }

    case types.CLEAR_ANIMATION: {
      return Object.assign({}, state, {
        'type': null,
        'bool': false,
      })
    }

    case 'STOP_ANIMATION': {
      return Object.assign({}, state, {
        'run': false
      })
    }

    default:
      return state
  }
};
