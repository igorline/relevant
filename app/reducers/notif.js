import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false};

export default function auth(state = initialState, action) {
  console.log(action.type)
  switch (action.type) {

    case types.SET_NOTIF: {
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
