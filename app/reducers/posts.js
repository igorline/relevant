import * as types from '../actions/actionTypes';

const initialState = {normalSort: {pages: null, page: null, index: null}, postError: null, activePost: null, ranked: {index: null, pages: null, page: null}};

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
        'normalSort': {
          'index': action.payload.posts,
          'pages': Math.ceil(action.payload.pages),
          'page': action.payload.page
        }
      })
    }

    case types.SET_POSTS_BY_RANK: {
      return Object.assign({}, state, {
        'ranked': {
          'index': action.payload.posts,
          'pages': Math.ceil(action.payload.pages),
          'page': action.payload.page
        }
      })
    }

    case 'UPDATE_POSTS': {
       return Object.assign({}, state, {
        'index': action.payload,
        'pages': state.pages,
        'page': state.page
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
      console.log(state, 'update post state');
      return Object.assign({}, state, {
        'ranked': {
          'index': updatePostElement(state.ranked.index, action.payload)
        },
        'normalSort': {
          'index':  updatePostElement(state.normalSort.index, action.payload)
        }
      })
    }


    default:
      return state
  }
};
