import * as types from 'core/actionTypes';
import * as utils from 'app/utils';
import * as errorActions from 'modules/ui/error.actions';
// eslint-disable-next-line
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import { setUserMemberships } from 'modules/community/community.actions';

const Alert = utils.alert.Alert();
let PushNotification;
let userDefaults;

let Analytics;
let ReactGA;
let ReactPixel;
let TwitterCT;

if (process.env.WEB !== 'true') {
  Analytics = require('react-native-firebase-analytics');
  userDefaults = require('react-native-swiss-knife').RNSKBucket;
  PushNotification = require('react-native-push-notification');
} else {
  ReactGA = require('react-ga').default;
  ReactPixel = require('react-facebook-pixel').default;
  TwitterCT = require('app/utils/social').TwitterCT;
}

const APP_GROUP_ID = 'group.com.4real.relevant';

const reqOptions = async () => {
  const token = await utils.storage.getToken();
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
};

export function setCommunity(community) {
  return dispatch => {
    utils.api.setCommunity(community);
    dispatch({
      type: types.SET_COMMUNITY,
      payload: community
    });
  };
}

export function setInviteCode(code) {
  return {
    type: types.SET_INVITE_CODE,
    payload: code
  };
}

export function updateInvite(invite) {
  return {
    type: types.UPDATE_INVITE,
    payload: invite
  };
}

export function sendPong() {
  return {
    type: 'server/pong'
  };
}

export function updateAuthUser(user) {
  return {
    type: types.UPDATE_AUTH_USER,
    payload: user
  };
}

export function setUser(user) {
  return {
    type: types.SET_USER,
    payload: user
  };
}

export function setSelectedUserData(data) {
  return {
    type: 'SET_SELECTED_USER_DATA',
    payload: data
  };
}

export function setUserIndex(userIndex) {
  return {
    type: types.SET_USER_INDEX,
    payload: userIndex
  };
}

export function setPreUser(preUser) {
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

export function cacheCommunity(community) {
  return async () => {
    try {
      await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/updateCommunity',
        body: JSON.stringify({ community })
      });
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  };
}

export function logoutAction(user) {
  return dispatch => {
    utils.storage.removeToken().then(() => {
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

export function updateUser(user, preventLocalUpdate) {
  return async dispatch => {
    try {
      const res = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/',
        body: JSON.stringify(user)
      });
      if (!preventLocalUpdate) dispatch(updateAuthUser(res));
      return true;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function updateNotificationSettings(
  notificationSettings,
  subscription,
  deviceTokens
) {
  return async dispatch => {
    try {
      const res = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/notifications',
        body: JSON.stringify({ notificationSettings, subscription, deviceTokens })
      });
      dispatch(updateAuthUser(res));
      return true;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function setDeviceToken(token) {
  return {
    type: 'SET_DEVICE_TOKEN',
    payload: token
  };
}

export function removeDeviceToken(auth) {
  if (!auth) return null;
  return dispatch => {
    const { user } = auth;
    if (user.deviceTokens) {
      const index = user.deviceTokens.indexOf(auth.deviceToken);
      if (index > -1) {
        user.deviceTokens.splice(index, 1);
        dispatch(updateUser(user, true));
      }
    }
  };
}

export function enableMobileNotifications(user) {
  return dispatch => {
    if (!user.notificationSettings.mobile.all) return;
    if (!PushNotification) return;
    configurePushNotifications(dispatch);
    registerPushNotification({ dispatch, user });
  };
}

function configurePushNotifications(dispatch) {
  PushNotification.configure({
    onNotification: notification => {
      // other params: foreground, message
      const { userInteraction, data } = notification;
      if (!userInteraction) return;
      if (data && data.postId) {
        const comment = data.comment ? { _id: data.comment } : null;
        dispatch(
          navigationActions.goToPost({
            _id: data.postId,
            title: data.post.title,
            comment
          })
        );
      }
    },
    // ANDROID ONLY: GCM Sender ID
    // need to receive remote push notifications)
    senderID: '271994332492',
    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true
    },
    popInitialNotification: true,
    requestPermissions: true
  });
}

function registerPushNotification({ dispatch, user }) {
  PushNotification.onRegister = deviceToken => {
    const { token } = deviceToken;
    userDefaults.set('deviceToken', token, APP_GROUP_ID);
    dispatch(setDeviceToken(token));
    const newUser = { ...user };
    if (user.deviceTokens && user.deviceTokens.indexOf(token) < 0) {
      newUser.deviceTokens.push(token);
    } else if (user.deviceTokens.indexOf(token) < 0) {
      newUser.deviceTokens = [token];
    }
    const notificationSettings = {
      ...newUser.notificationSettings
    };
    dispatch(
      updateNotificationSettings(notificationSettings, null, newUser.deviceTokens)
    );
  };
}

function setupUser(user, dispatch) {
  dispatch(setUser(user));
  dispatch(setSelectedUserData(user));
  dispatch(errorActions.setError('universal', false));
  dispatch(tooltipActions.tooltipReady(true));
  return user;
}

export function getUser(callback) {
  return async dispatch => {
    try {
      const token = await utils.storage.getToken();
      if (!token) return null;
      dispatch(loginUserSuccess(token));
      const user = await utils.api.request({
        method: 'GET',
        endpoint: 'user',
        path: '/me'
      });
      setupUser(user, dispatch);
      dispatch(enableMobileNotifications(user));
      if (user.memberships) {
        dispatch(setUserMemberships(user.memberships));
      }
      if (callback) callback(user);
      return user;
    } catch (error) {
      const message = error ? error.message : null;
      dispatch(errorActions.setError('universal', true, message));
      dispatch(loginUserFailure('Server error'));
      if (callback) callback({ ok: false });
      return null;
    }
  };
}

export function setOnboardingStep(step) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/onboarding/' + step, {
      credentials: 'include',
      method: 'GET',
      ...(await reqOptions())
    })
    .then(response => response.json())
    .then(responseJSON => {
      dispatch(updateAuthUser(responseJSON));
      return true;
    })
    .catch(() => false);
}

export function webOnboard(step) {
  return async () => {
    try {
      await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/webonboard',
        params: { step }
      });
      return true;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function loginUser(user) {
  return async dispatch => {
    try {
      const responseJSON = await utils.api.request({
        method: 'POST',
        endpoint: '/auth',
        path: '/local',
        body: JSON.stringify(user)
      });
      if (responseJSON.token) {
        await utils.storage.setToken(responseJSON.token);
        dispatch(loginUserSuccess(responseJSON.token));
        dispatch(getUser());
        return true;
      }
      dispatch(loginUserFailure(responseJSON.message));
      Alert.alert(responseJSON.message);
      return false;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function userOnline(user, token) {
  return () =>
    fetch(
      process.env.API_SERVER +
        '/notification/online/' +
        user._id +
        '?access_token=' +
        token,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => response.json())
    .catch(() => {
      // Handle error?
    });
}

export function checkUser(string, type, omitSelf = false) {
  return () =>
    fetch(
      `${
        process.env.API_SERVER
      }/api/user/check/user/?${type}=${string}&omitSelf=${omitSelf}`,
      {
        credentials: 'include',
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => response.json())
    .then(responseJSON => responseJSON)
    .catch(error => {
      Alert.alert(error.message);
    });
}

export function createUser(user, invitecode) {
  return dispatch =>
    fetch(process.env.API_SERVER + '/api/user', {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user, invitecode })
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => {
      if (responseJSON.token) {
        return utils.storage.setToken(responseJSON.token).then(() => {
          ReactGA &&
              ReactGA.event({
                category: 'User',
                action: 'Created an Account'
              });
          TwitterCT && TwitterCT.signUp();
          ReactPixel && ReactPixel.track('CompleteRegistration');
          Analytics && Analytics.logEvent('Created an Account');
          dispatch(loginUserSuccess(responseJSON.token));
          dispatch(getUser());
          return true;
        });
      }
      if (responseJSON.errors) {
        const { errors } = responseJSON;
        let message = '';
        Object.keys(errors).forEach(key => {
          if (errors[key].message) message += errors[key].message;
        });
        Alert.alert(message);
        return false;
      }
      return false;
    })
    .catch(error => {
      if (error.message.match('invitation code')) {
        dispatch(updateInvite(null));
      }
      Alert.alert(error.message);
      return false;
    });
}

export function updateHandle(user) {
  return async dispatch => {
    try {
      const result = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/updateHandle',
        body: JSON.stringify({ user })
      });
      ReactGA &&
        ReactGA.event({
          category: 'User',
          action: 'Created an Account'
        });
      Analytics && Analytics.logEvent('Created an Account');
      setupUser(result, dispatch);
      return true;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function sendConfirmation() {
  return async () =>
    fetch(process.env.API_SERVER + '/api/user/sendConfirmation', {
      method: 'GET',
      ...(await reqOptions())
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => {
      Alert.alert(
        'A confirmation email has been sent to ' + responseJSON.email,
        'success'
      );
      return true;
    })
    .catch(err => {
      Alert.alert('Error sending email, please try again ', err.message);
      return false;
    });
}

export function forgotPassword(user, query) {
  return async () =>
    fetch(process.env.API_SERVER + '/api/user/forgot' + (query || ''), {
      method: 'PUT',
      ...(await reqOptions()),
      body: JSON.stringify({ user })
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => responseJSON)
    .catch(err => {
      Alert.alert(err.message);
      return false;
    });
}

export function resetPassword(password, token) {
  return async () =>
    fetch(process.env.API_SERVER + '/api/user/resetPassword', {
      method: 'PUT',
      ...(await reqOptions()),
      body: JSON.stringify({ password, token })
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then(() => {
      Alert.alert('Your password has been updated! Try loggin in.', 'success');
      return true;
    })
    .catch(err => {
      Alert.alert(err.message);
      return false;
    });
}

export function confirmEmail(user, code) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/confirm', {
      method: 'PUT',
      ...(await reqOptions()),
      body: JSON.stringify({ user, code })
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => {
      Alert.alert('Your email has been confirmed');
      dispatch(updateAuthUser(responseJSON));
      return true;
    })
    .catch(err => {
      Alert.alert(err.message);
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
      const chart = await utils.api.request({
        method: 'GET',
        endpoint: 'relevanceStats',
        path: '/user',
        query: { start, end }
      });
      dispatch(setStats({ chart }));
      dispatch(errorActions.setError('stats', false));
      return true;
    } catch (error) {
      dispatch(errorActions.setError('stats', true, error.message));
      return false;
    }
  };
}

export function getStats(user) {
  return async dispatch => {
    try {
      const stats = await utils.api.request({
        method: 'GET',
        endpoint: 'relevance',
        path: `/user/${user._id}/stats`
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
      const relChart = await utils.api.request({
        method: 'GET',
        endpoint: 'statistics',
        path: '/user',
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
    payload: profile
  };
}

export function setLoading(loading) {
  return {
    type: types.SET_LOADING,
    payload: loading
  };
}

export function twitterAuth(profile, invite) {
  return async dispatch => {
    try {
      dispatch(setLoading(true));
      const result = await utils.api.request({
        method: 'POST',
        endpoint: '/auth/',
        path: 'twitter/login',
        body: JSON.stringify({ profile, invite })
      });
      if (!result) {
        throw new Error('Twitter Auth failed');
      }
      dispatch(setLoading(false));
      if (result.user && result.user.role === 'temp') {
        await utils.storage.setToken(result.token);
        dispatch(loginUserSuccess(result.token));

        dispatch(setPreUser(result.user));
        dispatch(setTwitter({ ...profile, token: result.token }));
        return false;
      }
      if (result.token && result.user) {
        await utils.storage.setToken(result.token);
        dispatch(loginUserSuccess(result.token));
        setupUser(result.user, dispatch);
      }
      return true;
    } catch (error) {
      dispatch(setTwitter(null));
      dispatch(setLoading(false));
      Alert.alert(error.message);
      return false;
    }
  };
}

export function addEthAddress(msg, sig, acc) {
  return async dispatch => {
    try {
      const result = await utils.api.request({
        method: 'PUT',
        endpoint: 'user',
        path: '/ethAddress',
        body: JSON.stringify({ msg, sig, acc })
      });
      dispatch(updateAuthUser(result));
      return true;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function cashOut() {
  return async dispatch => {
    try {
      const result = await utils.api.request({
        method: 'POST',
        endpoint: 'user',
        path: '/cashOut'
      });
      dispatch(updateAuthUser(result));
      return result.cashOut;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function userToSocket(user) {
  return dispatch => {
    if (!user) return;
    dispatch({ type: 'server/storeUser', payload: user });
  };
}

export function redeemInvite(invitecode) {
  return async dispatch => {
    try {
      const user = await utils.api.request({
        method: 'PUT',
        endpoint: 'invites',
        path: '/',
        body: JSON.stringify({ invitecode })
      });
      dispatch(setInviteCode(null));
      dispatch(updateAuthUser(user));
      Alert.alert('You are now a trusted admin of the community!', 'success');
    } catch (err) {
      dispatch(setInviteCode(null));
      // Alert.alert(err.message);
    }
  };
}
