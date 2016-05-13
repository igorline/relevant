import * as types from '../actions/actionTypes';

const initialState = {selectedUser: null};

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.SET_SELECTED_USER: {
      return Object.assign({}, state, {
        'selectedUser': action.payload
      })
    }
    default:
      return state
  }
};
