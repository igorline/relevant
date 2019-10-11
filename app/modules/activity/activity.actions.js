import * as types from 'core/actionTypes';
import * as errorActions from 'modules/ui/error.actions';
import { api, storage } from 'app/utils';
import { initPushNotifications } from 'app/utils/notifications';
import { updateNotificationSettings } from 'modules/auth/auth.actions';
import {
  SHOW_DESKTOP_PROMPT_AFTER_DAYS,
  SHOW_MOBILE_PROMPT_AFTER_DAYS,
  SHOW_BET_PROMPT_AFTER_DAYS
} from './notificationTimes';

let PushNotification;
if (process.env.WEB !== 'true') {
  PushNotification = require('react-native-push-notification');
}

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
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'notification',
          path: '/',
          auth: true,
          query: { skip }
        })
      );
      dispatch(setActivity(res, type, skip));
      dispatch(errorActions.setError('activity', false));
    } catch (err) {
      errorActions.setError('activity', true, err.message);
    }
  };
}

export function markRead() {
  return dispatch =>
    storage
      .getToken()
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
    storage
      .getToken()
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
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'notification',
          path: '/unread',
          auth: true
        })
      );
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
        updateNotificationSettings({ desktop: { all: true } }, subscription.toJSON())
      );
      dispatch(hideBannerPrompt());
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  };
}

export const showBetPrompt = async dispatch => {
  const isDismissed = await storage.isDismissed(
    'betDismissed',
    SHOW_BET_PROMPT_AFTER_DAYS
  );
  if (!isDismissed) return dispatch(showBannerPrompt('bet'));
  return false;
};

export const showPushNotificationPrompt = (promptProps = {}) => async dispatch => {
  if (process.env.BROWSER === true) {
    return handleDesktopPrompt({ dispatch, promptProps });
  }
  return handleMobilePrompt({ dispatch, promptProps });
};

async function handleDesktopPrompt({ dispatch, promptProps }) {
  if (
    Notification &&
    (Notification.permission === 'granted' || Notification.permission === 'denied')
  ) {
    return false;
  }
  const isDismissed = await storage.isDismissed(
    'pushDismissed',
    SHOW_DESKTOP_PROMPT_AFTER_DAYS
  );
  if (isDismissed) return false;

  return dispatch(showBannerPrompt('push', promptProps));
}

async function handleMobilePrompt({ dispatch, promptProps }) {
  if (!PushNotification) return false;

  const permissions = await new Promise((resolve, reject) => {
    PushNotification.checkPermissions(resp => {
      if (!resp) return reject();
      return resolve(resp);
    });
  });

  if (permissions.alert) return false;

  const isDismissed = await storage.isDismissed(
    'pushDismissed',
    SHOW_MOBILE_PROMPT_AFTER_DAYS
  );
  if (isDismissed) return false;

  return dispatch(showBannerPrompt('push', { ...promptProps, isMobile: true }));
}
