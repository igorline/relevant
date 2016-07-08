import * as types from '../actions/actionTypes';

const initialState = {bool: false, text: null, active: false, activity: null, count: null};
const REPLACE = 'REPLACE';

const countUnread = (notifications) => {
    var num = 0;
    notifications.forEach(function(activity) {
      if (!activity.read && activity.personal) num += 1;
    })
    if (num > 0) {
      return num;
    } else {
      return null;
    }
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
        'activity': action.payload,
        'count': countUnread(action.payload)
      })
    }

    default:
      return state
  }
};
