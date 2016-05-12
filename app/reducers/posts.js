import * as types from '../actions/actionTypes';

const initialState = {pages: null, page: null, index: null, userPosts: null, postError: null, activePost: null, feed: null};

const updatePostElement = (array, post) => {
  var index = array.findIndex(function(el){
    return el._id == post._id
  })
  return [
    ...array.slice(0, index),
    post,
    ...array.slice(index + 1)
  ]
}

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      return Object.assign({}, state, {
        'index': action.payload.posts,
        'pages': Math.ceil(action.payload.pages),
        'page': action.payload.page
      })
    }

    case types.SET_FEED: {
      return Object.assign({}, state, {
        'feed': action.payload
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

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        'index': updatePostElement(state.index, action.payload)
      })
    }


    default:
      return state
  }
};
