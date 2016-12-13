import * as types from '../actions/actionTypes';

const initialState = {index: [], count: null};
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

const addItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( function( el ) {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = arr.concat(removeDuplicates)
  return finalArr;
}

const addItem = (old, newObj) => {
  var newArr = [newObj];
  return newArr.concat(old);
}

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_MESSAGES: {
      return Object.assign({}, state, {
        'index': addItems(state.index, action.payload)
      })
    }

    case 'ADD_MESSAGE': {
      return Object.assign({}, state, {
        'index': addItem(state.index, action.payload),
        'count': state.count+=1
      })
    }

    case 'SET_MESSAGES_COUNT': {
      return Object.assign({}, state, {
        'count': action.payload
      })
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state
  }
};
