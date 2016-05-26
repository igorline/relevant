import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false, activity: null, count: null};
const REPLACE = 'REPLACE';

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_NOTIF: {
      return Object.assign({}, state, {
        'active': action.payload.active,
        'bool': action.payload.bool,
        'text': action.payload.text
      })
    }

    case 'SET_ACTIVITY': {
      return Object.assign({}, state, {
        'activity': action.payload
      })
    }

    case 'SET_COUNT': {
      return Object.assign({}, state, {
        'count': action.payload
      })
    }

    default:
      return state
  }
};
