import { handleEmailNotifications } from 'server/notifications/emailPushNotifications';
import { handleWebNotifications } from 'server/notifications/webPushNotifications';
import { handleMobileNotifications } from 'server/notifications/mobilePushNotifications';

const relevantEnv = process.env.RELEVANT_ENV;

export async function sendNotification(user, alert, payload) {
  try {
    if (relevantEnv !== 'production') return;
    handleEmailNotifications(payload);
    handleWebNotifications({ ...payload, alert });
    handleMobileNotifications(user, alert, payload);
    return;
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}
