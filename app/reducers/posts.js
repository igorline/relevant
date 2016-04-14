import * as types from '../actions/actionTypes';

const initialState = {index: null, userPosts: null, postError: null, activePost: null, pickerStatus: false, investId: null};

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

export default function auth(state = initialState, action) {
  console.log(action.type)
  switch (action.type) {

    case types.SET_POSTS: {
      return Object.assign({}, state, {
        'index': action.payload
      })
    }

    case types.OPEN_INVEST: {
      return Object.assign({}, state, {
        'pickerStatus': true,
        'investId': action.payload
      })
    }

    case types.CLOSE_INVEST: {
      return Object.assign({}, state, {
        'pickerStatus': false,
        'investId': null
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
