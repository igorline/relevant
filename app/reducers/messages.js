import * as types from '../actions/actionTypes';

const initialState = {index: null, count: null};
const REPLACE = 'REPLACE';

const countUnread = (messages) => {
    var num = 0;
    messages.forEach(function(message) {
      if (!message.read) num += 1;
    })
    if (num > 0) {
      return num;
    } else {
      return null;
    }
}

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_MESSAGES: {
      return Object.assign({}, state, {
        'index': action.payload,
        'count': countUnread(action.payload)
      })
    }

    default:
      return state
  }
};
