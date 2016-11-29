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

  // console.log(currentData, 'currentData');
  // console.log(newData, 'newData');
  // console.log(total, 'total');

  if (total <= 0) {
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

  // console.log(arr, 'returning')

  return arr;
}

export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENTS: {
      console.log(action.payload, 'payload here')
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
            data: updateComments(currentComments, action.payload.data, action.payload.index, action.payload.total),
            total: action.payload.total
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

