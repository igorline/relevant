import * as types from '../actions/actionTypes';

const initialState = {selectedUserId: null, selectedUserData: null, currentUserId: null}

export default function auth(state = initialState, action) {
  //console.log(action.type);
  switch (action.type) {

    case 'SET_SELECTED_USER': {
      return Object.assign({}, state, {
        'selectedUserId': action.payload
      })
    }

    case 'SET_SELECTED_USER_DATA': {
      return Object.assign({}, state, {
        'selectedUserData': action.payload,
        'currentUserId': action.payload._id
      })
    }

    case 'CLEAR_SELECTED_USER': {
      console.log('clear selected user');
      return Object.assign({}, state, {
        'selectedUserData': null,
        'selectedUserId': null
      })
    }


    default:
      return state
  }
};
