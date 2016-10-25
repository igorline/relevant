import * as types from '../actions/actionTypes';

const initialState = {
  comments: [],
  activePost: null
};

const removeItem = (array, item) => {
  let index = array.findIndex(el => el._id === item._id);
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ];
};

export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      console.log("SET_COMMENTS");
      return Object.assign({}, state, {
        comments: action.payload ? action.payload : [],
      });
    }

    case types.ADD_COMMENT: {
      console.log("ADD_COMMENT");
      return Object.assign({}, state, {
        comments: [...state.comments, action.payload],
      });
    }

    case types.REMOVE_COMMENT: {
      return Object.assign({}, state, {
        comments: removeItem(state.comments, action.payload),
      });
    }

    case types.SET_ACTIVE_POST: {
      console.log("SET_ACTIVE_POST");
      return Object.assign({}, state, {
        activePost: action.payload,
      });
    }

    default:
      return state;
  }
}

