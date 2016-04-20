import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false};
const REPLACE = 'REPLACE';

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_NOTIF: {
      console.log('received bool ', action.payload.bool)
      return Object.assign({}, state, {
        'active': action.payload.active,
        'bool': action.payload.bool,
        'text': action.payload.text
      })
    }

    default:
      return state
  }
};
