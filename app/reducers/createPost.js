import * as types from '../actions/actionTypes';

const initialState = {
  urlPreview: null,
  postBody: null,
  postUrl: null,
  postCategory: null,
  bodyTags: [],
  bodyMentions: [],
  postTags: [],
  postImage: null,
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
        postCategory: action.payload,
      };
    }

    case types.CLEAR_CREATE_POST: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
