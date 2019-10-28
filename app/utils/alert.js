import { toast } from 'react-toastify';

const IS_NATIVE = process.env.WEB !== 'true';
const IS_BROWSER = process.env.BROWSER;

export const browserAlerts = {
  alert: (message, alertType) => {
    toast(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      type: alertType || 'error',
      hideProgressBar: true
    });
  }
};

export function Alert() {
  if (IS_NATIVE) return require('react-native').Alert;
  if (IS_BROWSER) return browserAlerts;

  // eslint-disable-next-line
  return { alert: (a, b) => console.log(a, ' ', b) };
}
