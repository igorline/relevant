import Analytics from 'react-native-firebase-analytics';
import * as types from './actionTypes';
import * as utils from '../utils';
import * as errorActions from './error.actions';

let AlertIOS = utils.fetchUtils.Alert();
let rn = {};
let PushNotificationIOS;
let userDefaults;

utils.fetchUtils.env();

if (process.env.WEB != 'true') {
  rn = require('react-native');
  PushNotificationIOS = rn.PushNotificationIOS;
  userDefaults = require('react-native-user-defaults').default;
}

const APP_GROUP_ID = 'group.com.4real.relevant';

const reqOptions = async () => {
  let token;
  try {
    token = await utils.token.get();
  } catch (err) {
    console.log('no token');
  }
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
};

export function updateInvite(invite) {
  return {
    type: types.UPDATE_INVITE,
    payload: invite
  };
}

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
      // websocket message
      if (user && user._id) {
        dispatch({
          type: 'server/logout',
          payload: user._id
        });
      }
      dispatch(logout());
    });
  };
}

export function setCurrentTooltip(step) {
  return {
    type: types.SET_ONBOARDING_STEP,
    payload: step
  };
}

export function setOnboardingStep(step) {
  return async dispatch => {
    dispatch(setCurrentTooltip(step));
    return fetch(process.env.API_SERVER + '/api/user/onboarding/' + step, {
      credentials: 'include',
      method: 'GET',
      ...await reqOptions()
    })
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(updateAuthUser(responseJSON));
      return true;
    })
    .catch(err => {
      console.log(err);
      return false;
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
  };
}

export
function checkUser(string, type) {
  return (dispatch) => {
    return fetch(`${process.env.API_SERVER}/api/user/check/user/?${type}=${string}`, {
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
function createUser(user, invite) {
  return (dispatch) => {
    return fetch(process.env.API_SERVER + '/api/user', {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user, invite })
    })
    .then(utils.fetchUtils.handleErrors)
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
        console.log(message);
        AlertIOS.alert(message);
      }
    })
    .catch(error => {
      if (error.message.match('invitation code')) {
        dispatch(updateInvite(null));
      }
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
      .then(utils.fetchUtils.handleErrors)
      .then(response => response.json())
      .then((responseJSON) => {
        dispatch(setUser(responseJSON));

        Analytics.setUserProperty('relevance', Math.round(responseJSON.relevance).toString());
        Analytics.setUserProperty('posts', responseJSON.postCount.toString());
        Analytics.setUserProperty('upvotes', responseJSON.investmentCount.toString());

        dispatch(setSelectedUserData(responseJSON));
        if (process.env.WEB != 'true') {
          dispatch(addDeviceToken(responseJSON, token));
        }
        dispatch(errorActions.setError('universal', false));
        if (callback) callback(responseJSON);
      })
      .catch((error) => {
        console.log('get user error ', error);
        dispatch(errorActions.setError('universal', true, error.message));
        dispatch(loginUserFailure('Server error'));
        if (callback) callback({ ok: false });
        // need this in case user is logged in but there is an error getting account
        if (error.message !== 'Network request failed') {
          dispatch(logoutAction());
        }
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

export function updateUser(user, preventLocalUpdate) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user', {
      method: 'PUT',
      ...await reqOptions(),
      body: JSON.stringify(user)
    })
    .then(utils.fetchUtils.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      if (!preventLocalUpdate) dispatch(updateAuthUser(responseJSON));
      return true;
    })
    .catch((err) => {
      console.log(err, 'error');
      AlertIOS.alert(err.message);
      return false;
    });
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
                dispatch(updateUser(newUser));
              } else {
                console.log(user.deviceTokens);
                console.log('devicetoken already present in user');
              }
            } else {
              newUser.deviceTokens = [storedDeviceToken];
              console.log('adding devicetoken to user object', storedDeviceToken);
              dispatch(updateUser(newUser));
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
          dispatch(updateUser(newUser));
        } else {
          console.log(user.deviceTokens);
          console.log('devicetoken already present in user object');
        }
      } else {
        newUser.deviceTokens = [deviceToken];
        console.log('adding devicetoken to useroject', deviceToken);
        dispatch(updateUser(newUser));
      }
    });
  };
}

export function removeDeviceToken(auth) {
  if (!auth) return null;
  return dispatch => {
    let user = auth.user;
    if (user.deviceTokens) {
      let index = user.deviceTokens.indexOf(auth.deviceToken);
      if (index > -1) {
        console.log(user.deviceTokens, 'pre splice');
        user.deviceTokens.splice(index, 1);
        console.log(user.deviceTokens, 'post splice');
        console.log('upating user to', user);
        dispatch(updateUser(user, true));
      } else {
        console.log('devicetoken not present');
      }
    }
  };
}

export function sendConfirmation() {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/sendConfirmation', {
      method: 'GET',
      ...await reqOptions()
    })
    .then(utils.fetchUtils.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      return true;
    })
    .catch(err => {
      AlertIOS.alert('Error sending email, please try again');
      console.log(err);
      return false;
    });
}

export function forgotPassword(user) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/forgot', {
      method: 'PUT',
      ...await reqOptions(),
      body: JSON.stringify({ user })
    })
    .then(utils.fetchUtils.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      return responseJSON;
    })
    .catch(err => {
      AlertIOS.alert(err.message);
      console.log(err);
      return false;
    });
}

export function resetPassword(password, token) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/resetPassword', {
      method: 'PUT',
      ...await reqOptions(),
      body: JSON.stringify({ password, token })
    })
    .then(utils.fetchUtils.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      AlertIOS.alert('Your password has been updated! Try loggin in.');
      return true;
    })
    .catch(err => {
      AlertIOS.alert(err.message);
      console.log(err);
      return false;
    });
}

export function confirmEmail(user, code) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/confirm', {
      method: 'PUT',
      ...await reqOptions(),
      body: JSON.stringify({ user, code })
    })
    .then(utils.fetchUtils.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      AlertIOS.alert('Your email has been confirmed');
      dispatch(updateAuthUser(responseJSON));
      return true;
    })
    .catch(err => {
      AlertIOS.alert(err.message);
      console.log(err);
      return false;
    });
}
