import * as types from './actionTypes';
import * as errorActions from './error.actions';
import { token as tokenUtil } from '../utils';

require('../publicenv');

const apiServer = `${process.env.API_SERVER}/api/notification`;

const reqOptions = (token) => {
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
};

const tokenString = token => `?access_token=${token}`;

export function setActivity(data, type, index) {
  return {
    type: types.SET_ACTIVITY,
    payload: {
      data,
      type,
      index
    }
  };
}

export function resetActivity(data) {
  return {
    type: 'RESET_ACTIVITY',
    payload: data
  };
}

export function clearCount() {
  return {
    type: 'CLEAR_COUNT'
  };
}

export function setCount(data) {
  return {
    type: types.SET_COUNT,
    payload: data
  };
}

export
function getActivity(skip) {
  let type = 'personal';
  return dispatch =>
    tokenUtil.get()
    .then(token =>
      fetch(`${apiServer}?skip=${skip}`, {
        ...reqOptions(token),
        method: 'GET',
      })
    )
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setActivity(responseJSON, type, skip));
      dispatch(errorActions.setError('activity', false));
    })
    .catch((error) => {
      console.log('error', error);
      dispatch(errorActions.setError('activity', true, error.message));
    });
}

export
function getGeneralActivity(userId, skip) {
  let type = 'general';
  return dispatch =>
    tokenUtil.get()
    .then(token =>
      fetch(`${apiServer}/general?skip=${skip}`, {
        ...reqOptions(token),
        method: 'GET',
      })
    )
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setActivity(responseJSON, type, skip));
      dispatch(errorActions.setError('activity', false));
    })
    .catch((error) => {
      console.log('error', error);
      dispatch(errorActions.setError('activity', true, error.message));
    });
}

export function markRead() {
  return dispatch =>
    tokenUtil.get()
    .then(token =>
      fetch(`${apiServer}/markread`, {
        ...reqOptions(token),
        method: 'PUT',
      })
    )
    .then((res) => {
      console.log('updated mark read ', res)
      dispatch(clearCount())
    })
    // .then((responseJSON) => {
      // console.log(responseJSON);
    // })
    .catch(error => console.log('error', error));
}

export function createNotification(obj) {
  return () =>
    tokenUtil.get()
    .then(token =>
      fetch(`${apiServer}`, {
        ...reqOptions(token),
        method: 'POST',
        body: JSON.stringify(obj)
      })
    )
    .then(() => console.log('created notif'))
    .catch(err => console.log('create notification error ', err));
}

export function getNotificationCount() {
  return dispatch =>
    tokenUtil.get()
    .then(token =>
      fetch(`${apiServer}/unread`, {
        ...reqOptions(token),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => dispatch(setCount(responseJSON.unread)))
    .catch(err => console.log('Notification count error', err));
}

