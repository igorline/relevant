import * as types from '../actions/actionTypes';

const initialState = {
  commentsById: {},
  garbage: []
};

const maxGarbage = 2;

const removeItem = (array, item) => {
  let index = array.findIndex(el => el._id === item._id);
  if (index < 0) return array;
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ];
};

export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      let id = action.payload.postId;
      let currentComments = state.commentsById[id] || [];
      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [id]: [
            ...currentComments.slice(0, action.payload.index),
            ...action.payload.data,
          ],
        }
      };
    }

    case types.ARCHIVE_COMMENTS: {
      console.log(action.payload);
      let newGarbage = state.garbage.filter(i => i !== action.payload);
      newGarbage.push(action.payload);
      let removeId = newGarbage.slice(maxGarbage)[0];
      newGarbage = newGarbage.slice(0, maxGarbage);
      let commentsById = state.commentsById;
      if (removeId) {
        commentsById = {
          ...state.commentsById,
          [removeId]: null,
        };
      }
      console.log('removing ', removeId);
      console.log('new comment data ', commentsById);
      console.log('new garbage ', newGarbage);
      return {
        ...state,
        commentsById,
        garbage: newGarbage
      };
    }

    // TODO rethink these
    // case types.ADD_COMMENT: {
    //   console.log("ADD_COMMENT");
    //   return Object.assign({}, state, {
    //     index: [...state.index, action.payload],
    //   });
    // }

    // case types.REMOVE_COMMENT: {
    //   return Object.assign({}, state, {
    //     index: removeItem(state.index, action.payload),
    //   });
    // }


    default:
      return state;
  }
}
