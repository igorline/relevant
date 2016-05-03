import * as types from '../actions/actionTypes';

// const initialState = {online: null};

export default function auth(state = null, action) {
  switch (action.type) {

    case 'SET_ONLINE_USERS': {
      console.log(action.payload, 'setting online users');
      return action.payload.users;
    }

    default:
      return state
  }
};
