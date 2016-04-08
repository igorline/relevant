import * as types from '../actions/actionTypes';

const initialState = {selectedUser: null, posts: null};

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_SELECTED_USER: {
      return Object.assign({}, state, {
        'selectedUser': action.payload
      })
    }
    case types.SET_SELECTED_USER_POSTS: {
      return Object.assign({}, state, {
        'posts': action.payload
      })
    }
    default:
      return state
  }
};
