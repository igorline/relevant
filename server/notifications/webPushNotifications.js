const User = require('server/api/user/user.model');
const webPush = require('web-push');
const { getUrls } = require('./notificationHelper');

// if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
//   // eslint-disable-next-line
//   console.log(
//     'You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY ' +
//       'environment variables. You can use the following ones:'
//   );
//   // eslint-disable-next-line
//   console.log(webPush.generateVAPIDKeys());
// }

webPush.setVapidDetails(
  'https://relevant.community/',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/* eslint no-console: 0 */

// User.findOne({ handle: 'test' }).then(u => {
//   const payload = {
//     title: 'hello!',
//     body: 'testing notification!',
//     url: 'https://relevant.community',
//     icon: '/img/default_community.png'
//   };
//   exports.handleWebNotifications({ subscription: u.desktopSubscriptions, payload });
// });

exports.handleWebNotifications = async params => {
  try {
    let { toUser: user } = params;
    if (!user || !user.notificationSettings || !user.desktopSubscriptions) {
      user = await User.findOne(
        { _id: user._id },
        'notificationSettings desktopSubscriptions'
      );
    }
    if (
      !user.notificationSettings.desktop.all ||
      !user.desktopSubscriptions ||
      !user.desktopSubscriptions.length
    ) {
      return;
    }

    const { postUrl } = getUrls(params);

    const payload = {
      title: params.alert,
      url: postUrl,
      icon: '/img/default_community.png',
      body: params.post ? params.post.body : null
    };

    const options = {};
    const processed = user.desktopSubscriptions.map(subscription =>
      webPush.sendNotification(subscription, JSON.stringify(payload), options)
    );
    await Promise.all(processed);
  } catch (err) {
    // TODO remove failed or expired notifications
    console.log(err); // eslint-disable-line
  }
};
