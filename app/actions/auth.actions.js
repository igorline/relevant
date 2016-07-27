import * as types from './actionTypes';
import { push } from 'react-router-redux';
import thunk from 'redux-thunk';
import * as notifActions from './notif.actions';
var Contacts = require('react-native-contacts');
require('../publicenv');
import {
    AsyncStorage,
    PushNotificationIOS
} from 'react-native';
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

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
function logoutAction(user, token) {
    AsyncStorage.removeItem('token');
    return (dispatch) => {
        dispatch(logout());
        // dispatch(deviceToken(user, token));
    }
}

export
function logout() {
    return {
        type: types.LOGOUT_USER
    }
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
        .then((response) => response.json())
        .then((responseJSON) => {
            console.log(responseJSON, 'login response')
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
function userOnline(user, token) {
    return dispatch => {
        console.log(user, 'online user')
        return fetch(process.env.API_SERVER+'/notification/online/'+user._id+'?access_token='+token, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        .then((response) => response.json())
        .then((responseJSON) => {
            // console.log(responseJSON, 'login response')
        })
        .catch(error => {
            console.log(error, 'error');
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
    console.log('getuser', token, redirect)
    return dispatch => {
        if(!token){
            AsyncStorage.getItem('token')
                .then(token => {
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
            .then(utils.fetchError.handleErrors)
            .then((response) => response.json())
            .then((responseJSON) => {
                dispatch(loginUserSuccess(token));
                dispatch(setUser(responseJSON));
                dispatch(notifActions.createNotification(token, {
                    notification: {
                        type: 'online',
                        personal: false,
                        byUser: responseJSON._id
                    }
                }));
                dispatch(addDeviceToken(responseJSON, token))
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
function setDeviceToken(token) {
    return {
        type: 'SET_DEVICE_TOKEN',
        payload: token
    };
}

export function updateUser(user, authToken) {
    return function(dispatch) {
        fetch(process.env.API_SERVER+'/api/user?access_token='+authToken, {
            credentials: 'include',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then((response) => {
            console.log('updated user');
        })
        .catch((error) => {
            console.log(error, 'error');
        });
    }
}

export function addDeviceToken(user, authToken) {
    return function(dispatch) {
        PushNotificationIOS.addEventListener('register', function(deviceToken){
            console.log('PushNotificationIOS registration');
            dispatch(setDeviceToken(deviceToken))
            var newUser = user;
            if (user.deviceTokens) {
                if (user.deviceTokens.indexOf(deviceToken) < 0) {
                      newUser.deviceTokens.push(deviceToken);
                      console.log('adding token', deviceToken)
                      dispatch(updateUser(newUser, authToken));
                } else {
                    console.log('token already present');
                }
            } else {
                newUser.deviceTokens = [deviceToken];
                console.log('adding token', deviceToken)
                dispatch(updateUser(newUser,  authToken));
            }
        });
        PushNotificationIOS.requestPermissions();
    }
}

export function removeDeviceToken(auth) {
    return function(dispatch) {
        var user = auth.user;
        if (user.deviceTokens) {
            if (user.deviceTokens.indexOf(auth.deviceToken) > -1) {
                console.log('removing device', auth.deviceToken);
                var index = user.deviceTokens.indexOf(auth.deviceToken);
                console.log(user.deviceTokens, 'pre splice')
                user.deviceTokens.splice(index, 1);
                console.log(user.deviceTokens, 'post splice');
                dispatch(updateUser(user, auth.token));
            } else {
                console.log('devicetoken not present');
            }
        }
        PushNotificationIOS.abandonPermissions();
    }
}








