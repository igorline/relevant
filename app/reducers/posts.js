import * as types from '../actions/actionTypes';

const initialState = {tag: null,pages: null, page: null, comments: null, postError: null, activePost: null, index: [], feed: [], discoverTags: null, parentTags: null};

const updatePostElement = (array, post) => {
  if (!array) return;
  var index = array.findIndex(function(el) {
    return el._id == post._id;
  });

  if (index < 0) return array.slice(0);
  var newArr = [
    ...array.slice(0, index),
    post,
    ...array.slice(index + 1)
  ];
  return newArr;
}

const removePostElement = (array, post) => {
  if (!array) return;
  var index = array.findIndex(function(el) {
    return el._id == post._id;
  });
  if (index < 0) {
    console.log('post not present')
    return array;
  } else {
    console.log('removing post');
    array.splice(index, 1);
    return array;
  }

}

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      var newArr = state.index.concat(action.payload);
      return Object.assign({}, state, {
          'index': newArr
      })
    }

    case 'UPDATE_POSTS': {
       return Object.assign({}, state, {
        'index': action.payload
      })
    }

     case types.SET_TAG: {
       return Object.assign({}, state, {
        'tag': action.payload
      })
    }

    case types.SET_PARENT_TAGS: {
       return Object.assign({}, state, {
        'parentTags': action.payload
      })
    }


    case 'CLEAR_POSTS': {
       return Object.assign({}, state, {
        'index': [],
        'feed': []
      })
    }

    case types.POST_ERROR: {
      return Object.assign({}, state, {
        'postError': action.payload
      })
    }

    case types.SET_DISCOVER_TAGS: {
      return Object.assign({}, state, {
        'discoverTags': action.payload
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

    case types.SET_COMMENTS: {
      return Object.assign({}, state, {
        'comments': action.payload
      })
    }

    case types.SET_FEED: {
      var newArr = state.feed.concat(action.payload);
      return Object.assign({}, state, {
        'feed': newArr
      })
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        'index':  updatePostElement(state.index, action.payload)
      })
    }

    case types.REMOVE_POST: {
      return Object.assign({}, state, {
        'index':  removePostElement(state.index, action.payload)
      })
    }

    default:
      return state
  }
};
