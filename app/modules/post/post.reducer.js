import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import get from 'lodash/get';

const repostSchema = new schema.Entity(
  'posts',
  // { comments: [commentSchema], user: userSchema },
  { idAttribute: '_id' }
);

const linkSchema = new schema.Entity('links', {}, { idAttribute: '_id' });

const postSchema = new schema.Entity(
  'posts',
  {
    repost: { post: repostSchema },
    metaPost: linkSchema
  },
  { idAttribute: '_id' }
);

const initialState = {
  postError: null,
  feedUnread: null,
  feed: [],
  twitterFeed: [],
  // store top & bottom arrays here for feed render
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
  topics: {
    new: {},
    top: {},
    all: {}
  },
  posts: {},
  topPosts: [],
  related: {},
  links: {}
};

function mergePosts(posts, state) {
  const mPosts = {};
  if (!posts) return mPosts;
  Object.keys(posts).forEach(id => {
    // need to do this so reposted = null doesen't over-write existing value
    let { reposted } = posts[id];
    if (!reposted) reposted = state.posts[id] ? state.posts[id].reposted : undefined;
    const postData =
      (posts[id] && posts[id].data) || (state.posts[id] && state.posts[id].data);
    mPosts[id] = {
      ...state.posts[id],
      ...posts[id],
      reposted,
      postData
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
      const unread = state.feedUnread || 0;
      return {
        ...state,
        feedUnread: unread + 1
      };
    }

    case types.SET_FEED_COUNT: {
      return {
        ...state,
        feedUnread: action.payload
      };
    }

    case types.SET_POSTS_SIMPLE: {
      const posts = mergePosts(action.payload.data.entities.posts, state);
      return {
        ...state,
        posts: { ...state.posts, ...posts },
        links: {
          ...state.links,
          ...action.payload.data.entities.links
        }
      };
    }

    case types.SET_TOPIC_POSTS: {
      const { type, topic, index } = action.payload;
      const posts = mergePosts(action.payload.data.entities.posts, state);
      if (!state.topics[type][topic]) state.topics[type][topic] = [];
      return {
        ...state,
        topics: {
          ...state.topics,
          [type]: {
            ...state.topics[type],
            [topic]: [
              ...state.topics[type][topic].slice(0, index),
              ...action.payload.data.result[type]
            ]
          }
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
        },
        links: {
          ...state.links,
          ...action.payload.data.entities.links
        }
      };
    }

    case types.SET_POSTS: {
      const { type } = action.payload;
      const posts = mergePosts(action.payload.data.entities.posts, state);
      return {
        ...state,
        [type]: [
          ...state[type].slice(0, action.payload.index),
          ...action.payload.data.result[type]
        ],
        posts: { ...state.posts, ...posts },
        loaded: {
          ...state.loaded,
          [type]: true
        },
        links: {
          ...state.links,
          ...action.payload.data.entities.links
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
      const id = action.payload._id;
      const data = normalize(action.payload, postSchema);
      const updatePost = data.entities.posts[id];

      // need to do this so reposted = null doesen't over-write existing value
      let { reposted } = action.payload;
      if (!reposted) reposted = state.posts[id] ? state.posts[id].reposted : undefined;
      const postData = updatePost.data || get(state.posts[id], 'data');
      let embeddedUser = state.posts[id] ? state.posts[id].embeddedUser : null;
      // TODO normalize this — should keep this in users store
      if (
        updatePost.embeddedUser &&
        updatePost.embeddedUser.relevance &&
        updatePost.embeddedUser.relevance.pagerank !== undefined
      ) {
        embeddedUser = updatePost.embeddedUser;
      }

      return {
        ...state,
        links: {
          ...state.links,
          ...data.entities.links
        },
        posts: {
          ...state.posts,
          [id]: {
            ...state.posts[id],
            ...updatePost,
            reposted,
            data: postData,
            embeddedUser
          }
        }
      };
    }

    case types.REMOVE_POST: {
      const id = action.payload._id || action.payload;
      const newPosts = { ...state.posts };
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
      const { id } = action.payload;
      const currentPosts = state.userPosts[id] || [];
      const posts = mergePosts(action.payload.data.entities.posts, state);
      return {
        ...state,
        userPosts: {
          ...state.userPosts,
          [id]: [
            ...currentPosts.slice(0, action.payload.index),
            ...action.payload.data.result[id]
          ]
        },
        links: {
          ...state.links,
          ...action.payload.data.entities.links
        },
        posts: { ...state.posts, ...posts },
        loaded: {
          ...state.loaded,
          userPosts: true
        }
      };
    }

    case 'LOADING_USER_POSTS': {
      return {
        ...state,
        loaded: {
          ...state.loaded,
          userPosts: false
        }
      };
    }

    case types.CLEAR_POSTS: {
      const { type } = action.payload;
      return { ...state, [type]: [] };
    }

    case 'SET_NEW_POSTS_STATUS': {
      return {
        ...state,
        newPostsAvailable: {
          ...state.newPostsAvailable,
          [action.payload.community]:
            state.newPostsAvailable[action.payload.community] || 0 + 1
        }
      };
    }

    case types.POST_ERROR: {
      return { ...state, postError: action.payload };
    }

    case types.SET_DISCOVER_TAGS: {
      return { ...state, discoverTags: action.payload };
    }

    case 'SET_SELECTED_POST': {
      return { ...state, selectedPostId: action.payload };
    }

    case 'SET_SELECTED_POST_DATA': {
      const id = action.payload._id;
      let { reposted } = action.payload;
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
      return {
        ...state, // selectedPostData: null,
        selectedPostId: null
      };
    }

    case 'SET_NEW_FEED_STATUS': {
      return { ...state, newFeedAvailable: action.payload };
    }

    case 'CLEAR_USER_POSTS': {
      return { ...state, userPosts: {} };
    }

    // we store comments in post state
    case types.SET_COMMENTS: {
      return {
        ...state,
        posts: {
          ...state.posts,
          ...action.payload.comments
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

    case types.UNDO_POST_INVESTMENT: {
      const postId = action.payload;
      return {
        ...state,
        posts: {
          ...state.posts,
          [postId]: {
            ...state.posts[postId],
            myVote: null
          }
        }
      };
    }

    case types.UPDATE_POST_INVESTMENTS: {
      if (!action.payload) return state;
      const postId = action.payload.post;
      return {
        ...state,
        posts: {
          ...state.posts,
          [postId]: {
            ...state.posts[postId],
            myVote: action.payload
          }
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
