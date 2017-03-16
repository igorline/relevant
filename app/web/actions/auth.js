import { push } from 'react-router-redux';
import cookie from 'react-cookie';

import * as types from './actionTypes';
import * as utils from '../utils';

export function setUser(user) {
  return {
    type: types.SET_USER,
    payload: user
  };
}

export function loginUserSuccess(token) {
  cookie.save('token', token);
  return {
    type: types.LOGIN_USER_SUCCESS,
    payload: {
      token
    }
  };
}

export function loginUserFailure(error) {
  cookie.remove('token');
  return {
    type: types.LOGIN_USER_FAILURE,
    payload: {
      statusText: error
    }
  };
}

export function loginUserRequest() {
  return {
    type: types.LOGIN_USER_REQUEST
  };
}

export function logout() {
  cookie.remove('token');
  return {
    type: types.LOGOUT_USER
  };
}

export function logoutAndRedirect() {
  return (dispatch, state) => {
    dispatch(logout());
    dispatch(push('/login'));
  };
}

export function loginUser(user, redirect) {
  return (dispatch) => {
    dispatch(loginUserRequest());
    return fetch('/auth/local', {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (responseJSON.token) {
        dispatch(loginUserSuccess(responseJSON.token));
        dispatch(getUser(responseJSON.token, redirect));
      } else {
        dispatch(loginUserFailure(responseJSON.message));
      }
    })
    .catch(error => dispatch(loginUserFailure(error)));
  };
}
export
function createUser(user) {
  return (dispatch) => {
    return fetch('/api/user', {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (responseJSON.token) {
        dispatch(loginUserSuccess(responseJSON.token));
        dispatch(getUser(responseJSON.token));
      } else if (responseJSON.errors) {
        let errors = responseJSON.errors;
        let message = '';
        Object.keys(errors).forEach((key) => {
          if (errors[key].message) message += errors[key].message;
        });
        dispatch(loginUserFailure(message));
      }
    })
    .catch(error => dispatch(loginUserFailure(error.message)));
  };
}

export function getUser(token, redirect) {
  if (!token) token = utils.auth.getToken();
  return dispatch => {
    return fetch('/api/user/me', {
     credentials: 'include',
      method: 'GET',
      timeout: 0,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then((responseJSON) => {
      console.log("getuser responseJSON ", responseJSON);
      dispatch(setUser(responseJSON));
      if (redirect) dispatch(push(redirect));
    })
    .catch(error => dispatch(loginUserFailure(error.message)));
  };
}


// function readCookie(k){
//   return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2]
// }
// function deleteCookie( name ) {
//   document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
// }
