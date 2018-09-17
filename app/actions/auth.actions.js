import * as types from './actionTypes';
import * as utils from '../utils';
import * as errorActions from './error.actions';
import * as navigationActions from './navigation.actions';

let AlertIOS = utils.api.Alert();
let ReactNative = {};
let PushNotification;
let userDefaults;

utils.api.env();
let Analytics;
let Platform;
let okToRequestPermissions = true;;

if (process.env.WEB != 'true') {
  ReactNative = require('react-native');
  Analytics = require('react-native-firebase-analytics');
  userDefaults = require('react-native-swiss-knife').RNSKBucket;
  Platform = ReactNative.Platform;
  PushNotification = require('react-native-push-notification');
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
        return utils.token.set(responseJSON.token)
        .then(() => {
          dispatch(loginUserSuccess(responseJSON.token));
          dispatch(getUser());
          return true;
        });
      }
      AlertIOS.alert(responseJSON.message);
      dispatch(loginUserFailure(responseJSON.message));
      return false;
    })
    .catch((error) => {
      console.log(error, 'login error');
      AlertIOS.alert(error.message);
      return false;
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


export function createUser(user, invite) {
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
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      if (responseJSON.token) {
        return utils.token.set(responseJSON.token)
        .then(() => {
          dispatch(loginUserSuccess(responseJSON.token));
          dispatch(getUser());
          return true;
        });
      } else if (responseJSON.errors) {
        let errors = responseJSON.errors;
        let message = '';
        Object.keys(errors).map((key, index) => {
          if (errors[key].message) message += errors[key].message;
        });
        AlertIOS.alert(message);
        return false;
      }
    })
    .catch(error => {
      if (error.message.match('invitation code')) {
        dispatch(updateInvite(null));
      }
      AlertIOS.alert(error.message);
      return false;
    });
  };
}

export function updateHandle(user) {
  return async dispatch => {
    try {
      let result = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: `/updateHandle`,
        body: JSON.stringify({ user })
      });
      await utils.token.set(result.token);
      dispatch(loginUserSuccess(result.token));
      dispatch(getUser());
      return true;
    } catch (err) {
      console.log('error updating handle');
      AlertIOS.alert(err.message);
      return false;
    }
  };
}

function setupUser(user, dispatch) {
  dispatch(setUser(user));
  if (Analytics) {
    let r = user.relevance;
    let p = user.postCount;
    let i = user.investmentCount;

    r = r === 0 ? '0' : (r < 25 ? '25' : (r < 200 ? '200' : 'manu'));
    p = p === 0 ? '0' : (p < 10 ? '10' : (p < 30 ? '30' : 'many'));
    i = i === 0 ? '0' : (i < 25 ? '75' : (i < 200 ? '200' : 'many'));

    Analytics.setUserProperty('relevance', r);
    Analytics.setUserProperty('posts', p);
    Analytics.setUserProperty('upvotes', i);
  }

  dispatch(setSelectedUserData(user));
  if (process.env.WEB != 'true') {
    dispatch(addDeviceToken(user));
  }
  dispatch(errorActions.setError('universal', false));
  return user;
}

export function getUser(callback) {
  return (dispatch) => {
    function fetchUser(token) {
      return fetch(process.env.API_SERVER + '/api/user/me', {
        credentials: 'include',
        method: 'GET',
        timeout: 0,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(utils.api.handleErrors)
      .then(response => response.json())
      .then((user) => {
        setupUser(user, dispatch);
        if (callback) callback(user);
        return user;
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

    return utils.token.get()
    .then((newToken) => {
      console.log("got token! ", newToken);
      dispatch(loginUserSuccess(newToken));
      return fetchUser(newToken);
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
    .then(utils.api.handleErrors)
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

export function addDeviceToken(user) {
  return (dispatch) => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
        console.log( 'TOKEN:', token );
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        let { foreground, userInteraction, message, data } = notification;
        if (!userInteraction) return;
        if (data && data.type === 'postLink') {
          dispatch(navigationActions.goToPost({ _id: data._id, title: data.title }));
        }
      },

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: '271994332492',

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios' ? false : true,
    });

    if (Platform.OS === 'ios') {
      if (okToRequestPermissions) {
        okToRequestPermissions = false;
        PushNotification.requestPermissions()
        .then(() => {
          okToRequestPermissions = true;
          dispatch(navigationActions.tooltipReady(true));
        });
      }
    } else {
      dispatch(navigationActions.tooltipReady(true));
    }

    PushNotification.onRegister = (deviceToken) => {
      console.log('registered notification');
      let token = deviceToken.token;
      userDefaults.set('deviceToken', token, APP_GROUP_ID);
      dispatch(setDeviceToken(token));
      let newUser = user;
      if (user.deviceTokens && user.deviceTokens.indexOf(token) < 0) {
        newUser.deviceTokens.push(token);
        dispatch(updateUser(newUser));
      } else {
        newUser.deviceTokens = [token];
        dispatch(updateUser(newUser));
      }
    };
  };
}

export function removeDeviceToken(auth) {
  if (!auth) return null;
  return dispatch => {
    let user = auth.user;
    if (user.deviceTokens) {
      let index = user.deviceTokens.indexOf(auth.deviceToken);
      if (index > -1) {
        user.deviceTokens.splice(index, 1);
        dispatch(updateUser(user, true));
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
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      AlertIOS.alert('A confirmation email has been sent to ' + responseJSON.email);
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
    .then(utils.api.handleErrors)
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
    .then(utils.api.handleErrors)
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
    .then(utils.api.handleErrors)
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

export function setStats(stats) {
  return {
    type: types.SET_STATS,
    payload: stats
  };
}


export function getChart(start, end) {
  return async dispatch => {
    try {
      let chart = await utils.api.request({
        method: 'GET',
        endpoint: 'relevanceStats',
        path: `/user`,
        query: { start, end }
      });
      dispatch(setStats({ chart }));
      dispatch(errorActions.setError('stats', false));
      return true;
    } catch (error) {
      console.log(error);
      dispatch(errorActions.setError('stats', true, error.message));
      return false;
    }
  };
}

export function getStats(user) {
  return async dispatch => {
    try {
      let stats = await utils.api.request({
        method: 'GET',
        endpoint: 'relevance',
        path: `/user/${user._id}/stats`,
      });
      dispatch(setStats(stats));
      dispatch(errorActions.setError('stats', false));
      return true;
    } catch (error) {
      dispatch(errorActions.setError('stats', true, error.message));
      return false;
    }
  };
}

export function getRelChart(start, end) {
  return async dispatch => {
    try {
      let relChart = await utils.api.request({
        method: 'GET',
        endpoint: 'statistics',
        path: `/user`,
        query: { start, end }
      });
      dispatch(setStats({ relChart }));
      dispatch(errorActions.setError('stats', false));
      return true;
    } catch (error) {
      dispatch(errorActions.setError('stats', true, error.message));
      return false;
    }
  };
}

export function setTwitter(profile) {
  return {
    type: types.SET_TWITTER,
    payload: profile,
  };
}

export function setLoading(loading) {
  return {
    type: types.SET_LOADING,
    payload: loading,
  };
}

export function twitterAuth(profile, invite) {
  return async dispatch => {
    try {
      dispatch(setLoading(true));
      let result = await utils.api.request({
        method: 'POST',
        endpoint: '/auth/',
        path: `twitter/login`,
        body: JSON.stringify({ profile, invite })
      });
      dispatch(setLoading(false));
      if (result.token && result.user) {
        await utils.token.set(result.token);
        dispatch(loginUserSuccess(result.token));
        setupUser(result.user, dispatch);
      }
      if (result.twitter) {
        dispatch(setTwitter(profile));
      }
      return true;
    } catch (error) {
      dispatch(setTwitter(null));
      dispatch(setLoading(false));
      console.log(error);
      AlertIOS.alert(error.message);
      return false;
    }
  };
}

export function addEthAddress(msg, sig, acc) {
  return async dispatch => {
    try {
      let result = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: `/ethAddress`,
        body: JSON.stringify({ msg, sig, acc })
      });
      dispatch(updateAuthUser(result));
      return true;
    } catch(err) {
      console.log('error updating key');
      AlertIOS.alert(err.message);
      return false;
    }
  };
}

export function cashOut() {
  return async dispatch => {
    try {
      let result = await utils.api.request({
        method: 'POST',
        endpoint: 'user',
        path: `/cashOut`,
      });
      dispatch(updateAuthUser(result));
      return result.cashOut;
    } catch (err) {
      console.log('error cashing out');
      AlertIOS.alert(err.message);
      return false;
    }
  };
}


export function userToSocket(user) {
  return dispatch => {
    dispatch({ type: 'server/storeUser', payload: user });
  };
}
