import * as types from '../actions/actionTypes';

const initialState = {
  tag: null,
  pages: null,
  page: null,
  comments: null,
  postError: null,
  currentPostId: null,
  selectedPostData: null,
  selectedPostId: null,
  index: [],
  feed: [],
  top: [],
  new: [],
  discoverTags: [],
  parentTags: null,
  createPostCategory: null,
  newFeedAvailable: false,
  newPostsAvailable: false,
  currentUser: null,
  myPosts: [],
  userPosts: [],
  queued: [],
  user: [],
  newPosts: {
    index: [],
    feed: [],
  },
};

const updatePostElement = (array, post) => {
  if (!array) return;
  let index = array.findIndex(el => el._id === post._id);

  if (index < 0) return array;
  let newArr = [
    ...array.slice(0, index),
    post,
    ...array.slice(index + 1)
  ];
  return newArr;
};

const removeItem = (array, item) => {
  let index = array.findIndex(el => el._id === item._id);
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ];
};

const addItems = (arr, newArr) => {
  if (!arr.length) return newArr;
  const removeDuplicates = newArr.filter((el) => {
    return arr.indexOf( el ) < 0;
  });
  let finalArr = arr.concat(removeDuplicates);
  return finalArr;
};

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
    return old.slice();
  }
};

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      const type = action.payload.type;
      console.log('reducer type ', type);
      return Object.assign({}, state, {
        [type]: addItems(state[type], action.payload.data),
        currentUser: action.payload.userId ? action.payload.userId : state.currentUser,
        loading: false,
        newPostsAvailable: false,
        newFeedAvailable: false,
      });
    }

    case types.GET_POSTS: {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        top: updatePostElement(state.top, action.payload),
        new: updatePostElement(state.new, action.payload),
        feed: updatePostElement(state.feed, action.payload),
        userPosts: updatePostElement(state.feed, action.payload),
      });
    }

    case types.REMOVE_POST: {
      return Object.assign({}, state, {
        top: removeItem(state.top, action.payload),
        new: removeItem(state.new, action.payload),
        feed: removeItem(state.feed, action.payload),
        userPosts: removeItem(state.user, action.payload),
      });
    }

    case 'SET_MY_POSTS': {
      return Object.assign({}, state, {
        myPosts: addItems(state.myPosts, action.payload)
      });
    }

    case 'SET_USER_POSTS': {
      return Object.assign({}, state, {
        userPosts: addItems(state.userPosts, action.payload)
      });
    }


    case types.CLEAR_POSTS: {
      const type = action.payload.type;
      return Object.assign({}, state, {
        [type]: [],
      });
    }

    case 'ADD_POST': {
      const type = action.payload.type;
      return Object.assign({}, state, {
        newPosts: {
          ...state.newPosts,
          [type]: prependItems(state.newPosts[type], [action.payload.data]),
        },
      });
    }

    case types.REFRESH_POSTS: {
      const type = action.payload.type;
      console.log('Fresh posts', type);
      return {
        ...state,
        [type]: action.payload.data,
        loading: false,
      };
    }

    // case 'REFRESH_POSTS': {
    //   var type = action.payload.type;
    //   return Object.assign({}, state, {
    //     [type]:  prependItems(state[type], state.newPosts[type]),
    //     newPosts: {
    //       ...state.newPosts,
    //       [type]: []
    //     }
    //   })
    // }

    case 'SET_NEW_POSTS_STATUS': {
      return Object.assign({}, state, {
        newPostsAvailable: action.payload,
      });
    }

    case types.SET_TAG: {
      console.log('Setting tag');
      return {
        ...state,
        tag: action.payload,
      };
    }

    case types.SET_PARENT_TAGS: {
      return Object.assign({}, state, {
        parentTags: action.payload,
      });
    }

    case 'SET_POST_CATEGORY': {
      return Object.assign({}, state, {
        createPostCategory: action.payload,
      });
    }

    case types.POST_ERROR: {
      return Object.assign({}, state, {
        postError: action.payload,
      });
    }

    case types.SET_DISCOVER_TAGS: {
      return Object.assign({}, state, {
        discoverTags: action.payload,
      });
    }

    case 'SET_SELECTED_POST': {
      return Object.assign({}, state, {
        selectedPostId: action.payload,
      });
    }

    case 'SET_SELECTED_POST_DATA': {
      return Object.assign({}, state, {
        selectedPostData: action.payload,
        currentPostId: action.payload._id
      });
    }

    case 'CLEAR_SELECTED_POST': {
      return Object.assign({}, state, {
        selectedPostData: null,
        selectedPostId: null
      });
    }

    case 'SET_NEW_FEED_STATUS': {
      console.log('SET_NEW_FEED_STATUS');
      return Object.assign({}, state, {
        newFeedAvailable: action.payload,
      });
    }

    case 'CLEAR_USER_POSTS': {
      return Object.assign({}, state, {
        userPosts: [],
      });
    }

    default:
      return state;
  }
}
