import { toast } from 'react-toastify';

export const browserAlerts = {
  alert: (message, alertType) => {
    toast(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      type: alertType || 'error',
      hideProgressBar: true
    });
  }
};

export function Alert(noInput = false) {
  if (process.env.WEB !== 'true') {
    const ReactNative = require('react-native');
    const { Platform } = ReactNative;
    if (noInput) {
      return ReactNative.Alert;
    }
    if (Platform.OS === 'ios') {
      return ReactNative.AlertIOS;
    }
    return ReactNative.Alert;
  }
  if (process.env.BROWSER) {
    return browserAlerts;
  }
  // eslint-disable-next-line
  return { alert: (a, b) => console.log(a, ' ', b) };
}
