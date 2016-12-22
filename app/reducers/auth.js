import * as types from '../actions/actionTypes';

const initialState = {
  token: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null,
  user: null,
  deviceToken: null,
  preUser: null,
};

export default function auth(state = initialState, action) {
  switch (action.type) {

    case types.LOGIN_USER_REQUEST:
      return Object.assign({}, state, {
        isAuthenticating: true,
        statusText: null
      });

    case 'SET_PRE_USER':
      return Object.assign({}, state, {
        preUser: action.payload,
      });

    case types.LOGIN_USER_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticating: false,
        isAuthenticated: true,
        token: action.payload.token,
        statusText: 'You have been successfully logged in.'
      });

    case types.LOGIN_USER_FAILURE:
      return Object.assign({}, state, {
        isAuthenticating: false,
        isAuthenticated: false,
        user: null,
        //'statusText': action.payload.statusText
      });

    case 'SET_AUTH_STATUS_TEXT':
      return Object.assign({}, state, {
        statusText: action.payload
      });

    case types.LOGOUT_USER:
      return Object.assign({}, state, {
        isAuthenticated: false,
        token: null,
        deviceToken: null,
        user: null,
        statusText: 'You have been successfully logged out.'
      });

    case types.UPDATE_USER:
      if (!state.user || action.payload._id !== state.user._id) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case types.SET_USER:
      return Object.assign({}, state, {
        isAuthenticating: false,
        isAuthenticated: action.payload ? true : false,
        user: action.payload,
        preUser: null
      });

    case types.UPDATE_AUTH_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case 'SET_DEVICE_TOKEN':
      return Object.assign({}, state, {
        deviceToken: action.payload
      });

    case types.SET_CONTACTS:
      return Object.assign({}, state, {
        contacts: action.payload
      });


    default:
      return state;
  }
}
