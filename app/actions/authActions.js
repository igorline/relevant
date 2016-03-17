import * as types from './actionTypes';
import { push } from 'react-router-redux';
import request from 'superagent';
import thunk from 'redux-thunk';


export function setUser(user) {
  return {
    type: types.SET_USER,
    payload: user
  };
}

export function loginUserSuccess(token) {
  return {
    type: types.LOGIN_USER_SUCCESS,
    payload: {
      token: token
    }
  };
}

export function loginUserFailure(error) {
  return {
    type: types.LOGIN_USER_FAILURE,
    payload: {
      status: '',
      statusText: error
    }
  };
}

export function loginUserRequest() {
  return {
    type: types.LOGIN_USER_REQUEST
  }
}

export function logout() {
  return {
    type: types.LOGOUT_USER
  }
}

export function logoutAndRedirect() {
  // return (dispatch, state) => {
  //   dispatch(logout());
  //   dispatch(push('/login'));
  // }
}


export function authMessage(message) {
  return {
    type: types.SET_MESSAGE,
    payload: message
  };
}


export function loginUser(user, redirect) {
  return function(dispatch) {
    dispatch(loginUserRequest());
    fetch('http://localhost:3000/auth/local', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: user
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log(responseJSON, 'response');
      if (responseJSON.token) {
        dispatch(loginUserSuccess(responseJSON.token));
        dispatch(getUser(responseJSON.token, redirect));
      } else {
        dispatch(loginUserFailure(responseJSON.message));
      }
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(loginUserFailure('Server error'));
    });
  }
}

export function createUser(user, redirect) {
  // return function(dispatch) {
  //   dispatch(loginUserRequest());
  //   return request
  //     .post('/api/user/')
  //     .send(user)
  //     .set('Accept', 'application/json')
  //     .end(function(err, res){
  //       if(err) return  dispatch(loginUserFailure(err));
  //       dispatch(loginUserSuccess(res.body.token));
  //       dispatch(getUser(res.body.token));
  //     });
  // }
}

export function getUser(token, redirect){

  return dispatch => {
     console.log('get user')
    new Promise(function(resolve, reject) {
      if(!token) return dispatch(setUser());

      return fetch('http://localhost:3000/api/user/me', {
        credentials: 'include',
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
      })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON, 'response');
        dispatch(setUser(responseJSON));
      })
      .catch((error) => {
        console.log(error, 'error');
      });
    })
  }
}

function getToken(){
  var token = cookie.load('token');
  return token;
}