import * as types from './actionTypes';
import * as errorActions from './error.actions';
import * as utils from '../utils';

utils.api.env();
const Alert = utils.api.Alert().alert;
const apiServer = `${process.env.API_SERVER}/api/notification`;

const reqOptions = token => ({
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

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

export function getActivity(skip) {
  const type = 'personal';
  return dispatch =>
    utils.token
    .get()
    .then(token =>
      fetch(`${apiServer}?skip=${skip}`, {
        ...reqOptions(token),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => {
      dispatch(setActivity(responseJSON, type, skip));
      dispatch(errorActions.setError('activity', false));
    })
    .catch(error => dispatch(errorActions.setError('activity', true, error.message)));
}

export function markRead() {
  return dispatch =>
    utils.token
    .get()
    .then(token =>
      fetch(`${apiServer}/markread`, {
        ...reqOptions(token),
        method: 'PUT'
      })
    )
    .then(() => {
      dispatch(clearCount());
    })
    .catch(null);
}

export function createNotification(obj) {
  return () =>
    utils.token
    .get()
    .then(token =>
      fetch(`${apiServer}`, {
        ...reqOptions(token),
        method: 'POST',
        body: JSON.stringify(obj)
      })
    )
    .catch(null);
}

export function getNotificationCount() {
  return async dispatch => {
    try {
      const res = await utils.api.request({
        method: 'GET',
        endpoint: 'notification',
        path: '/unread',
        auth: true
      });
      dispatch(setCount(res.unread));
    } catch (err) {} // eslint-disable-line
  };
}
