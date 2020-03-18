import * as types from 'core/actionTypes';

const initialState = {
  urlPreview: null,
  domain: null,
  postBody: '',
  postUrl: null,
  postCategory: null,
  bodyTags: [],
  bodyMentions: [],
  allTags: [],
  postTags: [],
  postImage: null,
  nativeImage: false,
  repost: null,
  repostBody: null,
  edit: false,
  postId: null,
  editPost: null,
  keywords: [],
  createPreview: {},
  selectedTags: [],
  disableUrl: false
};

export default function createPost(state = initialState, action) {
  switch (action.type) {
    case types.SET_CREATE_POST_STATE: {
      return {
        ...state,
        ...action.payload
      };
    }

    case types.SET_POST_CATEGORY: {
      return {
        ...state,
        postCategory: action.payload
      };
    }

    case types.CLEAR_CREATE_POST: {
      return { ...initialState };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
