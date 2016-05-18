import * as types from '../actions/actionTypes';

const initialState = {pages: null, page: null, postError: null, activePost: null, index: [], feed: null, topTags: null};

const updatePostElement = (array, post) => {
  console.log('update posts', array);
  if (!array) return;
  var index = array.findIndex(function(el) {
    return el._id == post._id;
  });
  if (!index) return array.slice(0);
  return [
    ...array.slice(0, index),
    post,
    ...array.slice(index + 1)
  ];
}

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      var newArr = state.index.concat(action.payload);
      console.log(newArr, 'newArr')
      return Object.assign({}, state, {
          'index': newArr,
          // 'pages': Math.ceil(action.payload.pages),
          // 'page': action.payload.page
      })
    }

    case 'UPDATE_POSTS': {
       return Object.assign({}, state, {
        'index': action.payload,
        // 'pages': state.pages,
        // 'page': state.page
      })
    }

    case types.POST_ERROR: {
      return Object.assign({}, state, {
        'postError': action.payload
      })
    }

    case types.SET_TOP_TAGS: {
      console.log(action.payload, 'top tags payload')
      return Object.assign({}, state, {
        'topTags': action.payload
      })
    }

    case types.SET_ACTIVE_POST: {
      return Object.assign({}, state, {
        'activePost': action.payload
      })
    }

    case types.UPDATE_FEED: {
      return Object.assign({}, state, {
        'feed': updatePostElement(state.feed, action.payload)
      })
    }

    case types.SET_FEED: {
      return Object.assign({}, state, {
        'feed':  action.payload
      })
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        'index':  updatePostElement(state.index, action.payload)
      })
    }


    default:
      return state
  }
};
