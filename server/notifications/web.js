const webPush = require('web-push');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  // eslint-disable-next-line
  console.log(
    'You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY ' +
      'environment variables. You can use the following ones:'
  );
  // eslint-disable-next-line
  console.log(webPush.generateVAPIDKeys());
}

webPush.setVapidDetails(
  'https://relevant.community',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handleWebNotifications = async params => {
  try {
    const subscription = {};
    const payload = params;
    const options = {};

    await webPush.sendNotification(subscription, payload, options);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
};
