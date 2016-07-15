import * as types from '../actions/actionTypes';

const initialState = {tag: null, pages: null, page: null, comments: null, postError: null, activePost: null, index: [], feed: [], discoverTags: null, parentTags: null};

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

const removeItem = (array, item) => {
  if (!array) return;
  var index = array.findIndex(function(el) {
    return el._id == item._id;
  });
  if (index < 0) {
    console.log('item not present')
    return array;
  } else {
    console.log('removing item');
    array.splice(index, 1);
    return array;
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

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      console.log(action.payload, 'SET_POSTS payload')
      return Object.assign({}, state, {
          'index': addItems(state.index, action.payload)
      })
    }

    case types.ADD_POST: {
       return Object.assign({}, state, {
          'index': addItem(state.index, action.payload)
      })
    }

    case types.UPDATE_POSTS: {
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


    case types.CLEAR_POSTS: {
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

    case types.ADD_COMMENT: {
      return Object.assign({}, state, {
        'comments': addItem(state.comments, action.payload)
      })
    }

    case 'REMOVE_COMMENT': {
      return Object.assign({}, state, {
        'comments': removeItem(state.comments, action.payload)
      })
    }

    case types.ADD_POST_TO_FEED :{
      return Object.assign({}, state, {
        'feed': addItem(state.index, action.payload)
      })
    }

    case types.SET_FEED: {
      return Object.assign({}, state, {
        'feed': addItems(state.feed, action.payload)
      })
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        'index':  updatePostElement(state.index, action.payload)
      })
    }

    case types.REMOVE_POST: {
      return Object.assign({}, state, {
        'index':  removeItem(state.index, action.payload)
      })
    }

    default:
      return state
  }
};
