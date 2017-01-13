import {
  PushNotificationIOS,
  AlertIOS
} from 'react-native';
import userDefaults from 'react-native-user-defaults';
import * as types from './actionTypes';
import * as utils from '../utils';
import * as errorActions from './error.actions';

const APP_GROUP_ID = 'group.com.4real.relevant';
require('../publicenv');

export
function sendPong() {
  return {
    type: 'server/pong',
  };
}

export
function updateAuthUser(user) {
  return {
    type: types.UPDATE_AUTH_USER,
    payload: user
  };
}

export
function setUser(user) {
  return {
    type: types.SET_USER,
    payload: user
  };
}

export
function setSelectedUserData(data) {
  return {
    type: 'SET_SELECTED_USER_DATA',
    payload: data
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
function setPreUser(preUser) {
  return {
    type: 'SET_PRE_USER',
    payload: preUser
  };
}

export function setAuthStatusText(text) {
  return {
    type: 'SET_AUTH_STATUS_TEXT',
    payload: text || null
  };
}

export function loginUserSuccess(token) {
  return {
    type: types.LOGIN_USER_SUCCESS,
    payload: {
      token
    }
  };
}

export function loginUserFailure() {
  return {
    type: types.LOGIN_USER_FAILURE
  };
}

export function loginUserRequest() {
  return {
    type: types.LOGIN_USER_REQUEST
  };
}

export function logout() {
  return {
    type: types.LOGOUT_USER
  };
}

export function logoutAction(user) {
  return (dispatch) => {
    utils.token.remove()
    .then(() => {
      // dispatch(removeDeviceToken());
      dispatch(logout());
      // websocket message
      dispatch({
        type: 'server/logout',
        payload: user._id
      });
    });
  };
}

export function loginUser(user) {
  return (dispatch) => {
    return fetch(process.env.API_SERVER + '/auth/local', {
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
        utils.token.set(responseJSON.token)
        .then(() => {
          dispatch(loginUserSuccess(responseJSON.token));
          dispatch(getUser());
        });
      } else {
        AlertIOS.alert(responseJSON.message);
        dispatch(loginUserFailure(responseJSON.message));
      }
    })
    .catch((error) => {
      console.log(error, 'login error');
      AlertIOS.alert(error.message);
    });
  };
}

export
function userOnline(user, token) {
  return dispatch => {
    return fetch(process.env.API_SERVER + '/notification/online/' + user._id + '?access_token=' + token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
    })
    .catch(error => {
      console.log(error, 'error');
    });
  }
}

export
function checkUsername(username) {
  return (dispatch) => {
    return fetch(process.env.API_SERVER + '/api/user/check/' + username, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (responseJSON) {
        return false;
      }
      return true;
    })
    .catch((error) => {
      console.log(error, 'error');
      AlertIOS.alert(error.message);
    });
  };
}


export
function createUser(user) {
  console.log(user);
  return (dispatch) => {
    return fetch(process.env.API_SERVER + '/api/user', {
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
        utils.token.set(responseJSON.token)
        .then(() => {
          dispatch(loginUserSuccess(responseJSON.token));
          dispatch(getUser());
        });
      } else if (responseJSON.errors) {
        let errors = responseJSON.errors;
        let message = '';
        Object.keys(errors).map((key, index) => {
           if (errors[key].message) message += errors[key].message;
        });
        AlertIOS.alert(message);
      }
    })
    .catch(error => {
      AlertIOS.alert(error.message);
    });
  };
}

export function getUser(callback) {
  return (dispatch) => {
    function fetchUser(token) {
      fetch(process.env.API_SERVER + '/api/user/me', {
        credentials: 'include',
        method: 'GET',
        timeout: 0,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // .then(utils.fetchError.handleErrors)
      .then(response => response.json())
      .then((responseJSON) => {
        dispatch(setUser(responseJSON));
        dispatch(setSelectedUserData(responseJSON));
        dispatch(addDeviceToken(responseJSON, token));
        dispatch(errorActions.setError('universal', false));
        if (callback) callback(responseJSON);
      })
      .catch((error) => {
        dispatch(errorActions.setError('universal', true, error.message));
        dispatch(loginUserFailure('Server error'));
        if (callback) callback({ ok: false });
        // need this in case user is logged in but there is an error getting account
        dispatch(logoutAction());
        console.log('get user error ', error);
      });
    }

    utils.token.get()
    .then((newToken) => {
      dispatch(loginUserSuccess(newToken));
      fetchUser(newToken);
    })
    .catch((error) => {
      console.log('no token');
    });
  };
}

export
function setDeviceToken(token) {
  return {
    type: 'SET_DEVICE_TOKEN',
    payload: token
  };
}

export function updateUser(user, authToken, preventLocalUpdate) {
  return (dispatch) => {
    user.posts.map((post) => post._id);
    return fetch(process.env.API_SERVER + '/api/user?access_token=' + authToken, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (!preventLocalUpdate) dispatch(updateAuthUser(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}

export function addDeviceToken(user, authToken) {
  return (dispatch) => {
    PushNotificationIOS.checkPermissions((results) => {
      console.log(results, 'permissions ios');
      if (!results.alert) {
        console.log('requestPermissions');
        PushNotificationIOS.requestPermissions();
      } else {
        userDefaults.get('deviceToken', APP_GROUP_ID)
        .then(storedDeviceToken => {
          if (storedDeviceToken) {
            dispatch(setDeviceToken(storedDeviceToken));
            let newUser = user;
            if (user.deviceTokens) {
              if (user.deviceTokens.indexOf(storedDeviceToken) < 0) {
                newUser.deviceTokens.push(storedDeviceToken);
                console.log('adding devicetoken to user here', storedDeviceToken);
                dispatch(updateUser(newUser, authToken));
              } else {
                console.log(user.deviceTokens);
                console.log('devicetoken already present in user');
              }
            } else {
              newUser.deviceTokens = [storedDeviceToken];
              console.log('adding devicetoken to user object', storedDeviceToken);
              dispatch(updateUser(newUser, authToken));
            }
          } else {
            console.log('no userdefault devicetoken');
          }
        })
        .catch(err => {
          if (err) console.log('get devicetoken error', err);
        });
      }
    });


    PushNotificationIOS.addEventListener('register', (deviceToken) => {
      console.log('PushNotificationIOS registration');
      dispatch(setDeviceToken(deviceToken));
      userDefaults.set('deviceToken', deviceToken, APP_GROUP_ID)
      .then(() => {
        console.log('saved devicetoken to userDefaults');
      })
      .catch(err => {
        if (err) console.log('store devicetoken error', err);
      });
      let newUser = user;
      if (user.deviceTokens) {
        if (user.deviceTokens.indexOf(deviceToken) < 0) {
          newUser.deviceTokens.push(deviceToken);
          console.log('adding devicetoken to user object', deviceToken);
          dispatch(updateUser(newUser, authToken));
        } else {
          console.log(user.deviceTokens);
          console.log('devicetoken already present in user object');
        }
      } else {
        newUser.deviceTokens = [deviceToken];
        console.log('adding devicetoken to useroject', deviceToken);
        dispatch(updateUser(newUser, authToken));
      }
    });
  };
}

export function removeDeviceToken(auth) {
  if (!auth) return;
  return (dispatch) => {
    let user = auth.user;
    if (user.deviceTokens) {
      let index = user.deviceTokens.indexOf(auth.deviceToken);
      if (index > -1) {
        console.log(user.deviceTokens, 'pre splice');
        user.deviceTokens.splice(index, 1);
        console.log(user.deviceTokens, 'post splice');
        console.log('upating user to', user);
        dispatch(updateUser(user, auth.token, true));
      } else {
        console.log('devicetoken not present');
      }
    }
    // console.log('no device tokens');
    // userDefaults.remove('devicetoken', APP_GROUP_ID)
    // .then(data => {
    //     console.log('removed devicetoken from userdefault')
    // })
    // .catch(err => {
    //     if(err) console.log('remove devicetoken error', err);
    // })
    // console.log('abandonPermissions');
    // PushNotificationIOS.abandonPermissions();
  };
}

