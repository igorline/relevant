import * as types from '../actions/actionTypes';

const initialState = {index: null, userPosts: null, postError: null, activePost: null, recentPosts: null};

export default function auth(state = initialState, action) {
  console.log(action.type)
  switch (action.type) {

    case types.SET_POSTS: {
      return Object.assign({}, state, {
        'index': action.payload
      })
    }

     case types.SET_RECENT_POSTS: {
      return Object.assign({}, state, {
        'recentPosts': action.payload
      })
    }

    case types.SET_USER_POSTS: {
      return Object.assign({}, state, {
        'userPosts': action.payload
      })
    }

    case types.POST_ERROR: {
      return Object.assign({}, state, {
        'postError': action.payload
      })
    }

    case types.SET_ACTIVE_POST: {
      return Object.assign({}, state, {
        'activePost': action.payload
      })
    }

    default:
      return state
  }
};
