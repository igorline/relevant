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

const updateComments = (currentData, newData, index, total) => {
  let arr = [];
  if (!index) index = 0;

  if (total <= 10) {
    arr = [
      ...currentData.slice(0, index),
      ...newData,
    ];
  } else {
    arr = [
      ...newData,
      ...currentData.slice(0, index),
    ];
  }

  return arr;
};

export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {

      let total = action.payload.total;
      let id = action.payload.postId;
      let currentComments = [];

      if (state.commentsById[id]) {
        if (state.commentsById[id].data) currentComments = state.commentsById[id].data;
      }

      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [id]: {
            data: updateComments(currentComments, action.payload.data, action.payload.index, total),
            total
          }
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
              newComment
            ],
            total: postComments.total + 1
          }
        }
      };
      return newState;
    }

    case 'REMOVE_COMMENT': {
      let commentId = action.payload.commentId;
      let postId = action.payload.postId;
      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: {
            data: removeItem(state.commentsById[postId].data, commentId),
            total: state.commentsById[postId].total - 1
          }
        }
      };
    }

    case 'UPDATE_COMMENT': {
      let newComment = action.payload.data;
      let postId = action.payload.data.post._id || action.payload.data.post;

      return {
        ...state,
        commentsById: {
          ...state.commentsById,
          [postId]: {
            data: updateItem(state.commentsById[postId].data, newComment),
          }
        }
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}

