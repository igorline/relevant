import * as types from 'core/actionTypes';

const initialState = {
  pendingComments: {}
};

// NOTE: comment objects are stored in posts state
export default function chat(state = initialState, action) {
  switch (action.type) {
    case types.ADD_PENDING_COMMENT: {
      return {
        ...state,
        pendingComments: {
          ...state.pendingComments,
          [action.payload.post._id]: [
            ...(state.pendingComments[action.payload.post._id] || []),
            action.payload.comment
          ]
        }
      };
    }

    case types.REMOVE_PENDING_COMMENT: {
      const newState = {
        ...state,
        pendingComments: {
          ...state.pendingComments,
          [action.payload.post._id]: (
            state.pendingComments[action.payload.post._id] || []
          ).filter(comment => comment !== action.payload.comment)
        }
      };
      return newState;
    }

    default:
      return state;
  }
}
