import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false, personal: [], count: null, general: []};
const REPLACE = 'REPLACE';

const countUnread = (notifications) => {
    var num = 0;
    notifications.forEach(function(activity) {
      if (activity) {
        if (!activity.read && activity.personal) num += 1;
      }
    })
    if (num > 0) {
      return num;
    } else {
      return null;
    }
}

const addNew = (old, newObj) => {
  var newArr = [newObj];
  return newArr.concat(old);
}

const addItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( function( el ) {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = arr.concat(removeDuplicates)
  return finalArr;
}

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
        'personal': addItems(state.personal, action.payload),
        'count': countUnread(addItems(state.personal, action.payload))
      })
    }

    case 'RESET_ACTIVITY': {
      return Object.assign({}, state, {
        'personal': action.payload,
        'count': countUnread(action.payload)
      })
    }

    case 'CLEAR_COUNT': {
      return Object.assign({}, state, {
        'count': null
      })
    }

    case 'ADD_ACTIVITY': {
      var obj = null;
      if (action.payload.personal) {
        obj = {
          'personal': addItems(state.personal, [action.payload]),
          'count': countUnread(addItems(state.personal, [action.payload]))
        }
      } else {
        obj = {
          'general': addItems(state.general, [action.payload])
        }
      }
      return Object.assign({}, state, obj)
    }

    case 'SET_GENERAL_ACTIVITY': {
      return Object.assign({}, state, {
        'general': addItems(state.general, action.payload),
      })
    }

    case 'ADD_GENERAL_ACTIVITY': {
      return Object.assign({}, state, {
        'general': addItems(state.general, [action.payload]),
      })
    }

    default:
      return state
  }
};
