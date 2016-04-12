import * as types from '../actions/actionTypes';

const initialState = {index: null, userPosts: null, postError: null, activePost: null};

const updatePostElement = (array, post) => {
  console.log("UPDATING POST")
  var index = array.findIndex(function(el){
    return el._id == post._id
  })
  console.log(index)
  return [
    ...array.slice(0, index),
    post,
    ...array.slice(index + 1)
  ]
}

export default function auth(state = initialState, action) {
  console.log(action.type)
  console.log(action)
  switch (action.type) {

    case types.SET_POSTS: {
      return Object.assign({}, state, {
        'index': action.payload
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
      console.log(state)
      return state
  }
};
