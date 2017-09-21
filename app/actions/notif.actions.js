import * as types from './actionTypes';
import * as errorActions from './error.actions';
import * as utils from '../utils';
import * as authActions from './auth.actions';

// require('../publicenv');
utils.api.env();
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
    utils.token.get()
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

export function markRead() {
  return dispatch =>
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}/markread`, {
        ...reqOptions(token),
        method: 'PUT',
      })
    )
    .then((res) => {
      // console.log('updated mark read ', res);
      dispatch(clearCount());
    })
    // .then((responseJSON) => {
      // console.log(responseJSON);
    // })
    .catch(error => console.log('error', error));
}

export function createNotification(obj) {
  return () =>
    utils.token.get()
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
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}/unread`, {
        ...reqOptions(token),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => {
      if (responseJSON.unread > 0) {
        dispatch(authActions.getUser());
      }
      dispatch(setCount(responseJSON.unread));
    })
    .catch(err => console.log('Notification count error', err));
}

