import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false};
const REPLACE = 'REPLACE';

export default function auth(state = initialState, action) {
  // console.log(action.type, 'action type')
  switch (action.type) {

    case types.SET_NOTIF: {
      //console.log('received bool ', action.payload.bool)
      return Object.assign({}, state, {
        'active': action.payload.active,
        'bool': action.payload.bool,
        'text': action.payload.text
      })
    }

    // case 'SET_ONLINE_USERS': {
    //   console.log(action.payload, 'setting online users');
    //   return state;
    // }

    default:
      return state
  }
};
