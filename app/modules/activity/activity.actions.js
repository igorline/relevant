import * as types from 'core/actionTypes';
import * as errorActions from 'modules/ui/error.actions';
import { api, token, notifications } from 'app/utils';

const apiServer = `${process.env.API_SERVER}/api/notification`;

const reqOptions = tk => ({
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tk}`
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
  return async dispatch => {
    try {
      const type = 'personal';

      const res = await api.request({
        method: 'GET',
        endpoint: 'notification',
        path: '/',
        auth: true,
        query: { skip }
      });
      dispatch(setActivity(res, type, skip));
      dispatch(errorActions.setError('activity', false));
    } catch (err) {
      errorActions.setError('activity', true, err.message);
    }
  };
}

export function markRead() {
  return dispatch =>
    token
    .get()
    .then(tk =>
      fetch(`${apiServer}/markread`, {
        ...reqOptions(tk),
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
    token
    .get()
    .then(tk =>
      fetch(`${apiServer}`, {
        ...reqOptions(tk),
        method: 'POST',
        body: JSON.stringify(obj)
      })
    )
    .catch(null);
}

export function getNotificationCount() {
  return async dispatch => {
    try {
      const res = await api.request({
        method: 'GET',
        endpoint: 'notification',
        path: '/unread',
        auth: true
      });
      dispatch(setCount(res.unread));
    } catch (err) {} // eslint-disable-line
  };
}

export function showNotification(notification, notificationProps) {
  return {
    type: types.SHOW_NOTIFICATION,
    payload: {
      notification,
      notificationProps
    }
  };
}

export function hideNotification(notification) {
  return {
    type: types.HIDE_NOTIFICATION,
    payload: notification
  };
}

export function showDesktopNotificationPrompt(notificationProps = {}) {
  return dispatch => {
    if (
      Notification &&
      (Notification.permission === 'granted' || Notification.permission === 'denied')
    ) {
      return false;
    }
    const isDismissed = notifications.isDismissed('desktopDismissed', 7);
    if (!isDismissed) {
      dispatch(showNotification('desktop', notificationProps));
    }
    return false;
  };
}
