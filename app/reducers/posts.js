import * as types from '../actions/actionTypes';

const initialState = {
  postError: null,
  feedUnread: null,
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
  topics: {
    new: {},
    top: {}
  },
  posts: {},
  comments: {},
};

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.INC_FEED_COUNT: {
      return {
        ...state,
        feedUnread: state.feedUnread + 1,
      };
    }

    case types.SET_FEED_COUNT: {
      return {
        ...state,
        feedUnread: action.payload
      };
    }

    case types.SET_POSTS_SIMPLE: {
      return {
        ...state,
        posts: { ...state.posts, ...action.payload },
      };
    }

    case types.SET_TOPIC_POSTS: {
      const type = action.payload.type;
      const topic = action.payload.topic;
      const index = action.payload.index;
      if (!state.topics[type][topic]) state.topics[type][topic] = [];
      return {
        ...state,
        topics: {
          ...state.topics,
          [type]: {
            ...state.topics[type],
            [topic]: [
              ...state.topics[type][topic].slice(0, index),
              ...action.payload.data.result[type],
            ]
          }
        },
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
          // all: {
          //   ...state.metaPosts.all,
          //   ...action.payload.data.entities.metaPosts
          // },
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
      return {
        ...state,
        loaded: {
          ...state.loaded,
          [action.payload]: false
        }
      };
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
