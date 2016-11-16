import * as types from '../actions/actionTypes';

const initialState = {
  commentsById: {},
  garbage: []
};

const maxGarbage = 10;

const removeItem = (array, commentId) => {
  if (!array || !commentId) return;
  let index = array.findIndex(el => el._id === commentId);
  if (index < 0) return array;
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ];
};

const updateItem = (array, newComment) => {
  if (!array || !newComment) return;
  let index = array.findIndex(el => el._id === newComment._id);
  if (index < 0) return array;
  array[index] = newComment;
  let newArr = array.slice();
  return newArr;
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

    // TODO Garbage collection
    // case types.ARCHIVE_COMMENTS: {
    //   let newGarbage = state.garbage.filter(i => i !== action.payload);
    //   newGarbage.unshift(action.payload);

    //   let removeId = newGarbage.slice(maxGarbage)[0];
    //   newGarbage = newGarbage.slice(0, maxGarbage);

    //   let commentsById = state.commentsById;
    //   if (removeId) {
    //     commentsById = {
    //       ...state.commentsById,
    //       [removeId]: null,
    //     };
    //   }

    //   return {
    //     ...state,
    //     commentsById,
    //     garbage: newGarbage
    //   };
    // }

    // TODO rethink these
    // case types.ADD_COMMENT: {
    //   console.log("ADD_COMMENT");
    //   // return Object.assign({}, state, {
    //   //   index: [...state.index, action.payload],
    //   // });
    //   return state;
    // }


    case 'ADD_COMMENT': {
      let newComment = action.payload.newComment;
      let postId = action.payload.postId;
      let newArr = state.commentsById[postId].push(action.payload.newComment);

      return  {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: newArr,
        }
      };
    }

    case 'REMOVE_COMMENT': {
      let commentId = action.payload.commentId;
      let postId = action.payload.postId;
      return  {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: removeItem(state.commentsById[postId], commentId),
        }
      };
    }

    case 'UPDATE_COMMENT': {
      let newComment = action.payload.data;
      let postId = action.payload.postId;
      return  {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: updateItem(state.commentsById[postId], newComment),
        }
      };
    }


    default:
      return state;
  }
}

