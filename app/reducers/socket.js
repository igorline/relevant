import * as types from '../actions/actionTypes';

const initialState = {
  message: null,
  socketId: null,
  clientData: null,
  ping: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'message': {
      return Object.assign({}, state, {
        message: action.payload
      });
    }

    case 'socketId': {
      return Object.assign({}, state, {
        socketId: action.payload
      });
    }

    case 'clientData': {
      return Object.assign({}, state, {
        clientData: action.payload
      });
    }

    case 'ping': {
      return Object.assign({}, state, {
        ping: action.payload
      });
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
