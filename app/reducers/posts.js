import * as types from '../actions/actionTypes';
import view from './view';

const initialState = {
  tag: null,
  pages: null,
  page: null,
  comments: null,
  postError: null,
  activePost: null,
  index: [],
  feed: [],
  discoverTags: null,
  parentTags: null,
  createPostCategory: null,
  userPosts: {},
  newFeedAvailable: false,
  newPostsAvailable: false,
  currentUser: null,
  queued: [],
  user: [],
  newPosts: {
    index: [],
    feed: [],
  }
};

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

const prependItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  var removeDuplicates = newArr.filter( function( el ) {
    return arr.indexOf( el ) < 0;
  });
  var finalArr = removeDuplicates.concat(arr)
  return finalArr;
}

const addItem = (old, newObj) => {
  var newArr = [newObj];
  console.log('add item', newObj);
  if (old.indexOf(newObj) < 0) {
    return newArr.concat(old);
  } else {
    return old;
  }
}

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      var type = action.payload.type;
      return Object.assign({}, state, {
        [type]: addItems(state[type], action.payload.data),
        currentUser: action.payload.userId ? action.payload.userId : state.currentUser,
        loading: false,
        'newPostsAvailable': false,
        'newFeedAvailable': false
      })
    }

    case types.GET_POSTS: {
      return Object.assign({}, state, {
        loading: true,
      })
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        index: updatePostElement(state.index, action.payload),
        feed: updatePostElement(state.feed, action.payload),
        user: updatePostElement(state.feed, action.payload)
      })
    }

    case types.REMOVE_POST: {
      console.log("REMOVING POST")
      return Object.assign({}, state, {
        'index':  removeItem(state.index, action.payload),
        'feed':  removeItem(state.feed, action.payload),
        'user': removeItem(state.feed, action.payload)
      })
    }

    case types.CLEAR_POSTS: {
      var type = action.payload.type;
      return Object.assign({}, state, {
        [type]: [],
      })
    }

    case 'SET_USER_POSTS': {
      var arr = [];
      var user = action.payload.user;
      if (state.userPosts[user]) arr = state.userPosts[user];

      var newObj = {
        userPosts: {
          ...state.userPosts,
          [user]: addItems(arr, action.payload.posts)
        }
      };

      return Object.assign({}, state, newObj)
    }

    case 'ADD_POST': {
      var type = action.payload.type;
      return Object.assign({}, state, {
        newPosts: {
          ...state.newPosts,
          [type]: prependItems(state.newPosts[type], [action.payload.data])
        }
      })
    }

    case 'REFRESH_POSTS': {
      var type = action.payload.type;
      return Object.assign({}, state, {
        [type]:  prependItems(state[type], state.newPosts[type]),
        newPosts: {
          ...state.newPosts,
          [type]: []
        }
      })
    }

    case 'SET_NEW_POSTS_STATUS': {
      return Object.assign({}, state, {
        'newPostsAvailable':  action.payload
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

    case 'SET_POST_CATEGORY': {
       return Object.assign({}, state, {
        'createPostCategory': action.payload
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

    case types.REMOVE_COMMENT: {
      return Object.assign({}, state, {
        'comments': removeItem(state.comments, action.payload)
      })
    }

    case 'SET_NEW_FEED_STATUS': {
      console.log('SET_NEW_FEED_STATUS');
      return Object.assign({}, state, {
        'newFeedAvailable':  action.payload
      })
    }

    case 'CLEAR_USER_POSTS': {
      return Object.assign({}, state, {
        'user': [],
      })
    }

    default:
      return state
  }
};
