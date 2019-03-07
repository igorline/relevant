import * as types from 'core/actionTypes';

const initialState = {
  childComments: {}
};

// NOTE: comment objects are stored in posts state
export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      return {
        ...state,
        childComments: {
          ...state.childComments,
          ...action.payload.childComments
        }
      };
    }

    case types.ADD_COMMENT: {
      const newState = {
        ...state,
        childComments: {
          ...state.childComments,
          [action.payload.parentId]: [
            ...(state.childComments[action.payload.parentId] || []),
            action.payload.comment._id
          ]
        }
      };
      return newState;
    }

    default:
      return state;
  }
}
