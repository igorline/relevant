import * as types from '../actions/actionTypes';

const initialState = {
  postError: null,
  selectedPostData: {},
  index: [],
  feed: [],
  top: [],
  new: [],
  loading: true,
  loaded: {
    feed: false,
    top: false,
    new: false,
    userPosts: false,
  },
  newFeedAvailable: false,
  newPostsAvailable: false,
  userPosts: {},
  newPosts: {
    index: [],
    feed: [],
  },
};

const updatePostElement = (array, _post) => {
  if (!array) return;
  let index = array.findIndex(el => el._id === _post._id);

  if (index < 0) return array;

  let newPost = {
    ...array[index],
    ..._post
  };

  let newArr = [
    ...array.slice(0, index),
    newPost,
    ...array.slice(index + 1)
  ];
  return newArr;
};

const updateCommentaryElement = (array, _post) => {
  if (!array) return;

  let postIndex;
  let metaIndex;
  let meta = array.find((metaPost, i) => {
    metaIndex = i;
    postIndex = metaPost.commentary.findIndex(el => el._id === _post._id);
    return postIndex > -1;
  });

  if (!meta || metaIndex < 0) return array;


  let newPost = {
    ...meta.commentary[postIndex],
    ..._post
  };

  let newMeta = {
    ...meta,
    commentary: [
      ...meta.commentary.slice(0, postIndex),
      newPost,
      ...meta.commentary.slice(postIndex + 1)
    ]
  };

  let newArr = [
    ...array.slice(0, metaIndex),
    newMeta,
    ...array.slice(metaIndex + 1)
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

const removeCommentaryElement = (array, _post) => {
  if (!array) return;

  let postIndex;
  let metaIndex;
  let meta = array.find((metaPost, i) => {
    metaIndex = i;
    postIndex = metaPost.commentary.findIndex(el => el._id === _post._id);
    return postIndex > -1;
  });

  if (!meta || metaIndex < 0) return array;

  let newMeta = {
    ...meta,
    commentary: [
      ...meta.commentary.slice(0, postIndex),
      ...meta.commentary.slice(postIndex + 1)
    ]
  };

  let newArr;
  if (newMeta && newMeta.commentary.length === 0) {
    newArr = [
      ...array.slice(0, metaIndex),
      ...array.slice(metaIndex + 1)
    ];
    return newArr;
  }

  newArr = [
    ...array.slice(0, metaIndex),
    newMeta,
    ...array.slice(metaIndex + 1)
  ];
  return newArr;
};


export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS: {
      const type = action.payload.type;
      return Object.assign({}, state, {
        [type]: [
          ...state[type].slice(0, action.payload.index),
          ...action.payload.data,
        ],
        currentUser: action.payload.userId ? action.payload.userId : state.currentUser,
        loading: false,
        newPostsAvailable: false,
        newFeedAvailable: false,
        loaded: {
          ...state.loaded,
          [type]: true,
        }
      });
    }

    case types.GET_POSTS: {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    case types.UPDATE_POST: {
      return Object.assign({}, state, {
        top: updateCommentaryElement(state.top, action.payload),
        new: updateCommentaryElement(state.new, action.payload),
        feed: updatePostElement(state.feed, action.payload),
        // userPosts: updatePostElement(state.feed, action.payload),
      });
    }

    case types.REMOVE_POST: {
      return Object.assign({}, state, {
        top: removeCommentaryElement(state.top, action.payload),
        new: removeCommentaryElement(state.new, action.payload),
        feed: removeItem(state.feed, action.payload),
        // userPosts: removeItem(state.user, action.payload),
      });
    }

    // case 'SET_MY_POSTS': {
    //   return Object.assign({}, state, {
    //     myPosts: addItems(state.myPosts, action.payload)
    //   });
    // }

    case 'SET_USER_POSTS': {
      let id = action.payload.id;
      let currentPosts = state.userPosts[id] || [];
      return {
        ...state,
        userPosts: {
          ...state.userPosts,
          [id]: [
            ...currentPosts.slice(0, action.payload.index),
            ...action.payload.posts
          ]
        },
        count: {
          ...state.count,
          userPosts: true,
        }
      };
    }


    case types.CLEAR_POSTS: {
      const type = action.payload.type;
      return Object.assign({}, state, {
        [type]: [],
      });
    }

    // case 'ADD_POST': {
    //   const type = action.payload.type;
    //   return Object.assign({}, state, {
    //     newPosts: {
    //       ...state.newPosts,
    //       [type]: prependItems(state.newPosts[type], [action.payload.data]),
    //     },
    //   });
    // }

    case 'SET_NEW_POSTS_STATUS': {
      return Object.assign({}, state, {
        newPostsAvailable: action.payload,
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
      let id = action.payload._id;
      return {
        ...state,
        selectedPostData: {
          ...state.selectedPostData,
          [id]: action.payload
        }
      };
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
        userPosts: {},
      });
    }

    default:
      return state;
  }
}
