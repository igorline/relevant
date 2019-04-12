import * as types from 'core/actionTypes';
import * as errorActions from 'modules/ui/error.actions';
import { api, token, localStorage } from 'app/utils';
import { initPushNotifications } from 'utils/notifications';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
// import { Alert } from 'app/utils/alert';

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

export function showBannerPrompt(promptType, promptProps) {
  return {
    type: types.SHOW_BANNER_PROMPT,
    payload: {
      promptType,
      promptProps
    }
  };
}

export function hideBannerPrompt(notification) {
  return {
    type: types.HIDE_BANNER_PROMPT,
    payload: notification
  };
}

export function enableDesktopNotifications() {
  return async dispatch => {
    try {
      const subscription = await initPushNotifications();
      dispatch(
        updateNotificationSettings(
          {
            desktop: {
              all: {
                type: true
              }
            }
          },
          subscription.toJSON()
        )
      );
      dispatch(hideBannerPrompt());
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  };
}

export function showPushNotificationPrompt(promptProps = {}) {
  return dispatch => {
    if (process.env.BROWSER === true) {
      if (
        Notification &&
        (Notification.permission === 'granted' || Notification.permission === 'denied')
      ) {
        return false;
      }
      const isDismissed = localStorage.isDismissed('pushDismissed', 7);
      if (!isDismissed) {
        dispatch(showBannerPrompt('desktop', promptProps));
      }
    } else {
      // handle mobile push notifications
      // Check for mobile permissions / last dismissed
      // Alert('');
    }
    return false;
  };
}
