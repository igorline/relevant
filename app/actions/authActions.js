import * as types from './actionTypes';
import { push } from 'react-router-redux';
import request from 'superagent';
import thunk from 'redux-thunk';
var Contacts = require('react-native-contacts');
require('../publicenv');
var CookieManager = require('react-native-cookies');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');

export
function setUser(user) {
    return {
        type: types.SET_USER,
        payload: user
    };
}

export
function setUserIndex(userIndex) {
    return {
        type: types.SET_USER_INDEX,
        payload: userIndex
    };
}

export
function loginUserSuccess(token) {

    return {
        type: types.LOGIN_USER_SUCCESS,
        payload: {
            token: token
        }
    };
}

export
function loginUserFailure(error) {
    return {
        type: types.LOGIN_USER_FAILURE,
        payload: {
            status: '',
            statusText: error
        }
    };
}

export
function loginUserRequest() {
    return {
        type: types.LOGIN_USER_REQUEST
    }
}

export
function logout() {
    return {
        type: types.LOGOUT_USER
    }
}

export
function logoutAndRedirect() {
    // return (dispatch, state) => {
    //   dispatch(logout());
    //   dispatch(push('/login'));
    // }
}

export
function loginUser(user, redirect) {
    return function(dispatch) {
        dispatch(loginUserRequest());
        fetch('http://'+process.env.SERVER_IP+':3000/auth/local', {
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
                //console.log(responseJSON, 'response');
                if (responseJSON.token) {
                    dispatch(loginUserSuccess(responseJSON.token));
                    dispatch(getUser(responseJSON.token, true));
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

export
function loginJay(user, redirect) {
    return function(dispatch) {
        dispatch(loginUserRequest());
        fetch('http://'+process.env.SERVER_IP+':3000/auth/local', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: 'testcase@gmail.com', password: 'testpass'})
        })
            .then((response) => response.json())
            .then((responseJSON) => {
                //console.log(responseJSON, 'response');
                if (responseJSON.token) {
                    dispatch(loginUserSuccess(responseJSON.token));
                    dispatch(getUser(responseJSON.token, true));

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

export
function createUser(user, redirect) {
    return function(dispatch) {
        //dispatch(loginUserRequest());
        fetch('http://'+process.env.SERVER_IP+':3000/api/user', {
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
                //console.log(responseJSON, 'response');
                if (responseJSON.token) {
                    dispatch(loginUserSuccess(responseJSON.token));
                    dispatch(getUser(responseJSON.token, true));
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

export
function getUser(token, redirect) {
    return dispatch => {
        console.log('get user')
        new Promise(function(resolve, reject) {
            if (!token) return dispatch(setUser());

            return fetch('http://'+process.env.SERVER_IP+':3000/api/user/me', {
                    credentials: 'include',
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then((response) => response.json())
                .then((responseJSON) => {
                    //console.log(responseJSON, 'response');
                    dispatch(setUser(responseJSON));
                    if (redirect) dispatch(Actions.Profile);

                })
                .catch((error) => {
                    console.log(error, 'error');
                });
        })
    }
}

export
function userIndex() {
    console.log('user index action')
    return dispatch => {
        console.log('userIndex')
        new Promise(function(resolve, reject) {
            return fetch('http://'+process.env.SERVER_IP+':3000/api/user', {
                    credentials: 'include',
                    method: 'GET'
                    // headers: {'Authorization': `Bearer ${token}`}
                })
                .then((response) => response.json())
                .then((responseJSON) => {
                    //console.log(responseJSON, 'response');
                    dispatch(setUserIndex(responseJSON));
                })
                .catch((error) => {
                    console.log(error, 'error');
                });
        })
    }
}

export
function getContacts() {
    return function(dispatch) {
        console.log('trigger get contacts')
        Contacts.getAll((err, contacts) => {
            if (err && err.type === 'permissionDenied') {
                console.log(err, 'err')
            } else {
                dispatch(setContacts(contacts));
            }
        });
    }
}

export
function sortNumbers(contacts) {
    return function(dispatch) {
        var list = [];
        for (var i = 0; i < contacts.length; i++) {
            for (var x = 0; x < contacts[i].phoneNumbers.length; x++) {
                var altNum = contacts[i].phoneNumbers[x].number.replace(/\D/g, '');
                var num = Number(altNum);
                list.push(num);
                if (i == contacts.length - 1 && x == contacts[i].phoneNumbers.length - 1) dispatch(setContacts(list));
            };
        };
    }
}

export
function setContacts(contacts) {
    return {
        type: types.SET_CONTACTS,
        payload: contacts
    };
}

// export
// function getToken() {
//     var token = cookie.load('token');
//     return token;
// }

export
function changeName(name, user, token) {
    return function(dispatch) {
    console.log(name, user, token);
      fetch('http://'+process.env.SERVER_IP+':3000/api/user/name', {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( {
          _id: user._id,
          name: name
        })
      })
      // .then((response) => response.json())
      .then((response) => {
        dispatch(getUser(token, null));
      })
      .catch((error) => {
        console.log(error, 'error');
      });
    }
}

export
function changeBio(bio, user, token) {
    return function(dispatch) {
      fetch('http://'+process.env.SERVER_IP+':3000/api/user/bio', {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( {
          _id: user._id,
          bio: bio
        })
      })
      // .then((response) => response.json())
      .then((response) => {
        dispatch(getUser(token, null));
      })
      .catch((error) => {
        console.log(error, 'error');
      });
    }
}