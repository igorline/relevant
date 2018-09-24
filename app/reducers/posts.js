import * as types from '../actions/actionTypes';

const initialState = {
  postError: null,
  feedUnread: null,
  feed: [],
  twitterFeed: [],
  top: [],
  new: [],
  flagged: [],
  loading: true,
  loaded: {
    feed: false,
    top: false,
    new: false,
    twitterFeed: false,
    userPosts: false,
    topics: {}
  },
  newFeedAvailable: false,
  newPostsAvailable: {},
  userPosts: {},
  metaPosts: {
    new: {},
    top: {},
    flagged: {},
    all: {},
  },
  topics: {
    new: {},
    top: {}
  },
  posts: {},
  topPosts: [],
  related: {},
};

function mergePosts(posts, state) {
  let mPosts = {};
  if (!posts) return mPosts;
  Object.keys(posts).forEach(id => {
    // need to do this so reposted = null doesen't over-write existing value
    let reposted = posts[id].reposted;
    if (!reposted) reposted = state.posts[id] ? state.posts[id].reposted : undefined;
    mPosts[id] = {
      ...state.posts[id],
      ...posts[id],
      reposted
    };
  });
  return mPosts;
}

export default function post(state = initialState, action) {
  switch (action.type) {

    case types.SET_RELATED: {
      return {
        ...state,
        related: {
          ...state.related,
          [action.payload.postId]: action.payload.related
        }
      };
    }

    case types.SET_TOP_POSTS: {
      return {
        ...state,
        topPosts: action.payload
      };
    }

    case types.INC_FEED_COUNT: {
      let unread = state.feedUnread || 0;
      return {
        ...state,
        feedUnread: unread + 1,
      };
    }

    case types.SET_FEED_COUNT: {
      return {
        ...state,
        feedUnread: action.payload
      };
    }

    case types.SET_POSTS_SIMPLE: {
      let posts = mergePosts(action.payload, state);
      return {
        ...state,
        posts: { ...state.posts, ...posts },
      };
    }

    case types.SET_TOPIC_POSTS: {
      const type = action.payload.type;
      const topic = action.payload.topic;
      const index = action.payload.index;
      let posts = mergePosts(action.payload.data.entities.posts, state);
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
          all: {
            ...state.metaPosts.all,
            ...action.payload.data.entities.metaPosts
          },
          [type]: {
            ...state.metaPosts[type],
            ...action.payload.data.entities.metaPosts
          },
        },
        posts: { ...state.posts, ...posts },
        loaded: {
          ...state.loaded,
          [type]: true,
          topics: {
            ...state.loaded.topics,
            [topic]: {
              ...state.loaded.topics[topic],
              [type]: true
            }
          }
        }
      };
    }

    case types.SET_POSTS: {
      const type = action.payload.type;
      let posts = mergePosts(action.payload.data.entities.posts, state);
      return {
        ...state,
        [type]: [
          ...state[type].slice(0, action.payload.index),
          ...action.payload.data.result[type],
        ],
        metaPosts: {
          ...state.metaPosts,
          all: {
            ...state.metaPosts.all,
            ...action.payload.data.entities.metaPosts
          },
          [type]: {
            ...state.metaPosts[type],
            ...action.payload.data.entities.metaPosts
          },
        },
        posts: { ...state.posts, ...posts },
        loaded: {
          ...state.loaded,
          [type]: true,
        },
        newPostsAvailable: {}
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
      // need to do this so reposted = null doesen't over-write existing value
      let reposted = action.payload.reposted;
      if (!reposted) reposted = state.posts[id] ? state.posts[id].reposted : undefined;
      let metaPost = state.posts[id] ? state.posts[id].metaPost : undefined;
      if (typeof action.payload.metaPost === 'object') {
        metaPost = action.payload.metaPost;
      }
      return {
        ...state,
        posts: {
          ...state.posts,
          [id]: {
            ...state.posts[id],
            ...action.payload,
            metaPost,
            reposted
          }
        }
      };
    }

    case types.REMOVE_POST: {
      let id = action.payload._id || action.payload;
      let newPosts = { ...state.posts };
      delete newPosts[id];
      return {
        ...state,
        posts: {
          ...state.posts,
          [id]: null
        }
      };
    }

    case 'SET_USER_POSTS': {
      let id = action.payload.id;
      let currentPosts = state.userPosts[id] || [];
      let posts = mergePosts(action.payload.data.entities.posts, state);
      return {
        ...state,
        userPosts: {
          ...state.userPosts,
          [id]: [
            ...currentPosts.slice(0, action.payload.index),
            ...action.payload.data.result[id]
          ]
        },
        posts: { ...state.posts, ...posts },
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
      return {
        ...state,
        newPostsAvailable: {
          ...state.newPostsAvailable,
          [action.payload.community]: state.newPostsAvailable[action.payload.community] || 0 + 1,
        }
      };
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
      let reposted = action.payload.reposted;
      if (!reposted) reposted = state.posts[id] ? state.posts[id].reposted : undefined;
      return {
        ...state,
        posts: {
          ...state.posts,
          [id]: {
            ...state.posts[id],
            ...action.payload,
            reposted
          }
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

    // we store comments in post state
    case types.SET_COMMENTS: {
      return {
        ...state,
        posts: {
          ...state.posts,
          ...action.payload.data.entities.comments
        }
      };
    }

    case types.ADD_COMMENT: {
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.payload.comment._id]: action.payload.comment
        }
      };
    }


    // this wipes feed on login
    // case types.LOGIN_USER_SUCCESS: {
    //   return { ...initialState };
    // }

    // this wipes feed on logout
    // case types.LOGOUT_USER: {
    //   return { ...initialState };
    // }

    default:
      return state;
  }
}
