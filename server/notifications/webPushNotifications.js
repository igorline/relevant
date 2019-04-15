const User = require('server/api/user/user.model');
const webPush = require('web-push');
const { getUrls } = require('./notificationHelper');

if (process.env.NODE_ENV !== 'test') {
  initWebPush();
}

function initWebPush() {
  try {
    webPush.setVapidDetails(
      'https://relevant.community/',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    // console.log(err); // eslint-disable-line
  }
}

exports.handleWebNotifications = async params => {
  try {
    let { toUser: user } = params;

    const userObj = user.toObject();
    if (!userObj.notificationSettings || !userObj.desktopSubscriptions) {
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
      body: params.post ? params.post.body || params.post.title : null
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
