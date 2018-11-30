import * as types from '../actions/actionTypes';

const initialState = {
  commentsById: {},
};

// NOTE: comment objects are stored in posts state
export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      let total = action.payload.total;
      let id = action.payload.postId;
      let currentComments = state.commentsById[id] ? state.commentsById[id].data : [];
      let postCommentList = action.payload.data.result[id];

      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [id]: {
            data: [...new Set([...postCommentList, ...currentComments])],
            total
          }
        }
      };
    }

    case 'ADD_COMMENT': {
      let newComment = action.payload.comment;
      let postId = action.payload.postId;
      let postComments = state.commentsById[postId];
      if (!state.commentsById[postId]) {
        postComments = {
          total: 0,
          data: []
        };
      }

      let newState = {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: {
            data: [
              ...postComments.data,
              newComment._id
            ],
            total: postComments.total + 1
          }
        }
      };
      return newState;
    }

    default:
      return state;
  }
}

