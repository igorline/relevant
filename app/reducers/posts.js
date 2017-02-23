import * as types from '../actions/actionTypes';

const initialState = {
  postError: null,
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
  metaPosts: {
    new: {},
    top: {},
  },
  posts: {},
  comments: {},
};

// may need at some point to remove the ids from the array

// const removeItem = (array, item) => {
//   let index = array.findIndex(el => el._id === item._id);
//   return [
//     ...array.slice(0, index),
//     ...array.slice(index + 1)
//   ];
// };

// const removeCommentaryElement = (array, _post) => {
//   if (!array) return;

//   let postIndex;
//   let metaIndex;
//   let meta = array.find((metaPost, i) => {
//     metaIndex = i;
//     postIndex = metaPost.commentary.findIndex(el => el._id === _post._id);
//     return postIndex > -1;
//   });

//   if (!meta || metaIndex < 0) return array;

//   let newMeta = {
//     ...meta,
//     commentary: [
//       ...meta.commentary.slice(0, postIndex),
//       ...meta.commentary.slice(postIndex + 1)
//     ]
//   };

//   let newArr;
//   if (newMeta && newMeta.commentary.length === 0) {
//     newArr = [
//       ...array.slice(0, metaIndex),
//       ...array.slice(metaIndex + 1)
//     ];
//     return newArr;
//   }

//   newArr = [
//     ...array.slice(0, metaIndex),
//     newMeta,
//     ...array.slice(metaIndex + 1)
//   ];
//   return newArr;
// };


export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_POSTS_SIMPLE: {
      return {
        ...state,
        posts: { ...state.posts, ...action.payload },
      };
    }

    case types.SET_POSTS: {
      const type = action.payload.type;

      // console.log(action.payload.data);
      return {
        ...state,
        [type]: [
          ...state[type].slice(0, action.payload.index),
          ...action.payload.data.result[type],
        ],
        metaPosts: {
          ...state.metaPosts,
          [type]: {
            ...state.metaPosts[type],
            ...action.payload.data.entities.metaPosts
          },
        },
        comments: { ...state.comments, ...action.payload.data.entities.comments },
        posts: { ...state.posts, ...action.payload.data.entities.posts },
        loaded: {
          ...state.loaded,
          [type]: true
        }
      };
    }

    case types.GET_POSTS: {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    case types.UPDATE_POST: {
      let id = action.payload._id;
      return {
        ...state,
        posts: {
          ...state.posts,
          [id]: {
            ...state.posts[id],
            ...action.payload
          }
        }
      };
    }

    case types.REMOVE_POST: {
      let id = action.payload._id;
      let newPosts = { ...state.posts };
      delete newPosts[id];
      return {
        ...state,
        posts: newPosts
      };
    }

    case 'SET_USER_POSTS': {
      let id = action.payload.id;
      let currentPosts = state.userPosts[id] || [];
      return {
        ...state,
        userPosts: {
          ...state.userPosts,
          [id]: [
            ...currentPosts.slice(0, action.payload.index),
            ...action.payload.data.result[id]
          ]
        },
        posts: { ...state.posts, ...action.payload.data.entities.posts },
        loaded: {
          ...state.loaded,
          userPosts: true,
        }
      };
    }


    case 'LOADING_USER_POSTS': {
      return {
        ...state,
        loaded: {
          ...state.loaded,
          userPosts: false,
        }
      };
    }


    case types.CLEAR_POSTS: {
      const type = action.payload.type;
      return Object.assign({}, state, {
        [type]: [],
      });
    }

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
        posts: {
          ...state.posts,
          [id]: action.payload
        }
      };
    }

    case 'CLEAR_SELECTED_POST': {
      return Object.assign({}, state, {
        // selectedPostData: null,
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

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
