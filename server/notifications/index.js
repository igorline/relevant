import { handleEmailNotifications } from 'server/notifications/emailPushNotifications';
import { handleWebNotifications } from 'server/notifications/webPushNotifications';
import { handleMobileNotifications } from 'server/notifications/mobilePushNotifications';

export async function sendNotification(user, alert, payload) {
  try {
    handleEmailNotifications(payload);
    handleWebNotifications({ ...payload, alert });
    handleMobileNotifications(user, alert, payload);
    return;
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}
