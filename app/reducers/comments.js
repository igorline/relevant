import * as types from '../actions/actionTypes';

const initialState = {
  commentsById: {}
};

// NOTE: comment objects are stored in posts state
export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      const total = action.payload.total;
      const id = action.payload.postId;
      const currentComments = state.commentsById[id] ? state.commentsById[id].data : [];
      const postCommentList = action.payload.data.result[id];

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
      const newComment = action.payload.comment;
      const postId = action.payload.postId;
      let postComments = state.commentsById[postId];
      if (!state.commentsById[postId]) {
        postComments = {
          total: 0,
          data: []
        };
      }

      const newState = {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: {
            data: [...postComments.data, newComment._id],
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
