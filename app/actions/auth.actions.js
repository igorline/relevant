import * as types from './actionTypes';
import { push } from 'react-router-redux';
import thunk from 'redux-thunk';
import * as notifActions from './notif.actions';
import userDefaults from 'react-native-user-defaults';
const APP_GROUP_ID = 'group.com.4real.relevant';
require('../publicenv');
import {
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
function setAuthStatusText(text) {
    var set = text ? text : null;
    return {
        type: 'SET_AUTH_STATUS_TEXT',
        payload: set
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
        userDefaults.remove('token', APP_GROUP_ID)
            .then(() => {
                dispatch({
                    type: types.LOGIN_USER_FAILURE,
                    payload: {
                        status: '',
                        statusText: error
                    }
                })
                setTimeout(function() {
                    dispatch(setAuthStatusText());
                }, 500);
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

    return (dispatch) => {
       userDefaults.remove('token', APP_GROUP_ID)
           .then(data => {
                dispatch(logout());
                dispatch({type:'server/logout', payload: user});
            })
    }
}

export
function logout() {
    return {
        type: types.LOGOUT_USER
    }
}

export function loginUser(user, redirect) {
    return function(dispatch) {
        console.log(user, 'user')
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

                userDefaults.set('token', responseJSON.token, APP_GROUP_ID)
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
        return fetch(process.env.API_SERVER+'/api/user', {
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
function getUser(token, redirect, callback) {
    return dispatch => {
        if (!token) {
            userDefaults.get('token', APP_GROUP_ID)
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
                    type: 'online',
                    personal: false,
                    byUser: responseJSON._id
                }));
                dispatch(addDeviceToken(responseJSON, token))
                if(callback) callback(responseJSON);
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

// export
// function getContacts() {
//     return function(dispatch) {
//         console.log('trigger get contacts')
//         Contacts.getAll((err, contacts) => {
//             if (err && err.type === 'permissionDenied') {
//                 console.log(err, 'err')
//             } else {
//                 dispatch(setContacts(contacts));
//             }
//         });
//     }
// }

// export
// function sortNumbers(contacts) {
//     return function(dispatch) {
//         var list = [];
//         for (var i = 0; i < contacts.length; i++) {
//             for (var x = 0; x < contacts[i].phoneNumbers.length; x++) {
//                 var altNum = contacts[i].phoneNumbers[x].number.replace(/\D/g, '');
//                 var num = Number(altNum);
//                 list.push(num);
//                 if (i == contacts.length - 1 && x == contacts[i].phoneNumbers.length - 1) dispatch(setContacts(list));
//             };
//         };
//     }
// }

// export
// function setContacts(contacts) {
//     return {
//         type: types.SET_CONTACTS,
//         payload: contacts
//     };
// }

export
function setDeviceToken(token) {
    return {
        type: 'SET_DEVICE_TOKEN',
        payload: token
    };
}

export function updateUser(user, authToken) {
    return function(dispatch) {
        var minified = user;
        minified.posts = [];
        user.posts.forEach(function(post, i) {
            minified.posts.push(post._id);
        })
       return fetch(process.env.API_SERVER+'/api/user?access_token='+authToken, {
            credentials: 'include',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(minified)
        })
        .then((response) => {
            console.log('updated user');
            return true;
        })
        .catch((error) => {
            console.log(error, 'error');
            return false;
        });
    }
}

export function addDeviceToken(user, authToken) {
    return function(dispatch) {

        PushNotificationIOS.checkPermissions(function(results) {
            console.log(results, 'permissions ios');
            if (!results.alert) {
                PushNotificationIOS.requestPermissions();
            } else {
                userDefaults.get('deviceToken', APP_GROUP_ID)
                .then(storedDeviceToken => {
                    if (storedDeviceToken) {
                        dispatch(setDeviceToken(storedDeviceToken));
                        var newUser = user;
                        if (user.deviceTokens) {
                            if (user.deviceTokens.indexOf(storedDeviceToken) < 0) {
                                  newUser.deviceTokens.push(storedDeviceToken);
                                  console.log('adding devicetoken to useroject here', storedDeviceToken)
                                  dispatch(updateUser(newUser, authToken));
                            } else {
                                console.log('devicetoken already present in useroject');
                            }
                        } else {
                            newUser.deviceTokens = [storedDeviceToken];
                            console.log('adding devicetoken to useroject', storedDeviceToken);
                            dispatch(updateUser(newUser, authToken));
                        }
                    } else {
                        console.log('no userdefault devicetoken');
                    }
                })
                .catch(err => {
                    if(err) console.log('get devicetoken error', err);
                })
            }
        })


        PushNotificationIOS.addEventListener('register', function(deviceToken){
            console.log('PushNotificationIOS registration');
            dispatch(setDeviceToken(deviceToken));
            userDefaults.set('deviceToken', deviceToken, APP_GROUP_ID)
            .then( ()  => {
                console.log('saved devicetoken to userDefaults');
            })
            .catch(err => {
                if(err) console.log('store devicetoken error', err);
            })
            var newUser = user;
            if (user.deviceTokens) {
                if (user.deviceTokens.indexOf(deviceToken) < 0) {
                      newUser.deviceTokens.push(deviceToken);
                      console.log('adding devicetoken to user object', deviceToken)
                      dispatch(updateUser(newUser, authToken));
                } else {
                    console.log('devicetoken already present in user object');
                }
            } else {
                newUser.deviceTokens = [deviceToken];
                console.log('adding devicetoken to useroject', deviceToken)
                dispatch(updateUser(newUser,  authToken));
            }
        });
    }
}

export function removeDeviceToken(auth) {
    return function(dispatch) {
        var user = auth.user;
        if (user.deviceTokens) {
            if (user.deviceTokens.indexOf(auth.deviceToken) > -1) {
                console.log('removing devicetoken from useroject');
                var index = user.deviceTokens.indexOf(auth.deviceToken);
                console.log(user.deviceTokens, 'pre splice')
                user.deviceTokens.splice(index, 1);
                console.log(user.deviceTokens, 'post splice');
                dispatch(updateUser(user, auth.token));
            } else {
                console.log('devicetoken not present');
            }
        }
        // userDefaults.remove('devicetoken', APP_GROUP_ID)
        // .then(data => {
        //     console.log('removed devicetoken from userdefault')
        // })
        // .catch(err => {
        //     if(err) console.log('remove devicetoken error', err);
        // })
        // console.log('abandonPermissions');
        // PushNotificationIOS.abandonPermissions();
    }
}








