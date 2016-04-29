import * as types from './actionTypes';
import { push } from 'react-router-redux';
import thunk from 'redux-thunk';
var Contacts = require('react-native-contacts');
require('../publicenv');
var CookieManager = require('react-native-cookies');
import {AsyncStorage} from 'react-native';
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

export
function setUser(user) {
    //console.log('set user', user)
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
    return  {
        type: types.LOGIN_USER_SUCCESS,
        payload: {
            token: token
        }
    }
}

export
function loginUserFailure(error) {
    return dispatch => {
        AsyncStorage.removeItem('token')
            .then(() => {
                dispatch({
                    type: types.LOGIN_USER_FAILURE,
                    payload: {
                        status: '',
                        statusText: error
                    }
                })
            })
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
    AsyncStorage.removeItem('token')
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
    return dispatch => {
        dispatch(loginUserRequest());
        return fetch(process.env.API_SERVER+'/auth/local', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        //.then(utils.fetchError.handleErrors)
        .then((response) => response.json())
        .then((responseJSON) => {
            if (responseJSON.token) {
                AsyncStorage.setItem('token', responseJSON.token)
                    .then( ()  => {
                        dispatch(loginUserSuccess(responseJSON.token));
                        dispatch(getUser(responseJSON.token, true));
                        return {status: true};
                    })
            } else {
                dispatch(loginUserFailure(responseJSON.message));
                return {status: false, message: responseJSON.message};
            }
        })
        .catch(error => {
            console.log(error, 'error');
            dispatch(loginUserFailure('Server error'));
             return {status: false, message: 'Server error'};
        });
    }
}


export
function createUser(user, redirect) {
    return function(dispatch) {
        fetch(process.env.API_SERVER+'/api/user', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(utils.fetchError.handleErrors)
        .then((response) => response.json())
        .then((responseJSON) => {
            if (responseJSON.token) {
                dispatch(loginUserSuccess(responseJSON.token));
                dispatch(getUser(responseJSON.token, true));
            } else {
                dispatch(loginUserFailure(responseJSON.message));
            }
        })
        .catch(error => {
            console.log(error, 'error');
            dispatch(loginUserFailure('Server error'));
        });
    }
}

export
function getUser(token, redirect) {
    return dispatch => {
        if(!token){
            //console.log('no token')
            AsyncStorage.getItem('token')
                .then(token => {
                    //console.log("GOT TOKEN", token);
                    if (token) {
                        return fetchUser(token);
                    } else {
                        return;
                    }
                })
                .catch(err => {
                    if(err) return dispatch(setUser());
                })
        } else fetchUser(token);
        function fetchUser(token) {
            fetch(process.env.API_SERVER+'/api/user/me', {
                credentials: 'include',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            //.then(utils.fetchError.handleErrors)
            .then((response) => response.json())
            //.then(utils.fetchError.handleErrors)
            .then((responseJSON) => {
                dispatch(loginUserSuccess(token));
                dispatch(setUser(responseJSON));
                dispatch({type:'server/storeUser', payload: responseJSON});
                if (redirect) dispatch(Actions.Profile);
            })
            .catch(error => {
                console.log(error, 'error');
                dispatch(loginUserFailure('Server error'));
            });
        }
    }
}

export
function userIndex() {
    return dispatch => {
        new Promise(function(resolve, reject) {
            return fetch(process.env.API_SERVER+'/api/user', {
                    credentials: 'include',
                    method: 'GET'
                })
                .then(utils.fetchError.handleErrors)
                .then((response) => response.json())
                .then((responseJSON) => {
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

export
function changeName(name, user, token) {
    return function(dispatch) {
    //console.log(name, user, token);
      fetch(process.env.API_SERVER+'/api/user?access_token='+token, {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      //.then(utils.fetchError.handleErrors)
      .then((response) => {
        dispatch(getUser(token, null));
      })
      .catch((error) => {
        console.log(error, 'error');
      });
    }
}

export function setPicture(url, user, token) {
    return function(dispatch) {
      var newUser = user;
      newUser.image = url;
      fetch(process.env.API_SERVER+'/api/user?access_token='+token, {
          credentials: 'include',
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
      })
      .then((response) => {
        dispatch(getUser(token, null));
      })
      .catch((error) => {
          console.log(error, 'error');
      });
    }
}