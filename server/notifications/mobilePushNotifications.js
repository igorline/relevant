import apn from 'apn';
import Notification from 'server/api/notification/notification.model';
import User from 'server/api/user/user.model';

/* eslint no-console: 0 */

const options = {
  cert: process.env.APN_CERT || 'server/dev-cert.pem',
  key: process.env.APN_KEY || 'server/dev-key.pem',
  production: process.env.NODE_ENV === 'production'
};

const KEY = process.env.ANDROID_KEY;

const settings = {
  gcm: {
    id: KEY
  },
  apn: {
    cert: process.env.APN_CERT || 'server/dev-cert.pem',
    key: process.env.APN_KEY || 'server/dev-key.pem',
    production: process.env.NODE_ENV === 'production'
  }
};

const PushNotifications = require('node-pushnotifications');

const push = new PushNotifications(settings);

function initNotificationService() {
  try {
    return new apn.Provider(options);
  } catch (err) {
    // console.log(err)
    return { on: () => null };
  }
}
const service = initNotificationService();

service.on('connected', () => {
  console.log('Connected');
});

service.on('transmitted', (notification, device) => {
  console.log('Notification transmitted to:' + device.token.toString('hex'));
});

service.on('transmissionError', (errCode, notification, device) => {
  console.error(
    'Notification caused error: ' + errCode + ' for device ',
    device,
    notification
  );
  if (errCode === 8) {
    const deviceToken = device.toString('utf8');
    console.log('device id', deviceToken);
    User.findOneAndUpdate(
      { _id: notification.payload.toUser },
      { $pull: { deviceTokens: deviceToken } }
    ).exec();
    console.log(
      'A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox'
    );
  }
});

service.on('timeout', () => {
  console.log('Connection Timeout');
});

service.on('disconnected', () => {
  console.log('Disconnected from APNS');
});

service.on('socketError', console.error);

async function handleMobileNotifications(user, alert, payload) {
  try {
    if (!user) return;

    const userObj = user.toObject();
    if (!userObj.notificationSettings || !userObj.deviceTokens) {
      user = await User.findOne({ _id: user._id });
    }

    if (
      !user.notificationSettings.mobile.all ||
      !user.deviceTokens ||
      !user.deviceTokens.length
    ) {
      return;
    }

    const { post } = payload;
    const badge = await Notification.countDocuments({
      forUser: user._id,
      read: false
    });
    // badge += await Feed.count({ userId: user._id, read: false });

    const registrationIds = [];
    user.deviceTokens.forEach(deviceToken => {
      registrationIds.push(deviceToken);
      console.log('pushing to device tokens ', deviceToken);
    });

    const postId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;

    const notePayload = payload.post
      ? {
          postId,
          title: post.title,
          community: post.data ? post.data.community : post.community,
          comment: post.parentPost ? post._id : null
        }
      : {};

    const data = {
      body: alert,
      expiry: Math.floor(Date.now() / 1000) + 3600,
      custom: { ...notePayload, toUser: user._id },
      // this has the effect of playing the sound if we have an alert
      // and silence when there is no alert
      // 0 causes the default sound to be played
      sound: alert ? 0 : 1,
      badge,
      topic: 'org.reactjs.native.Relevant',
      contentAvailable: 1
    };

    const results = await push.send(registrationIds, data);

    if (!results) {
      console.log('notification error');
    }
    let updatedTokens = user.deviceTokens;
    results.forEach(result => {
      result.message.forEach(message => {
        if (message.error) {
          updatedTokens = updatedTokens.filter(token => token !== message.regId);
          console.log('push notification error ', message.error);
          console.log('removing device token', message.regId);
        }
      });
    });
    if (updatedTokens.length !== user.deviceTokens.length) {
      user.markModified('deviceTokens');
      user.deviceTokens = updatedTokens;
      await user.save();
    }
  } catch (err) {
    console.log('push notifications error', err);
  }
}

module.exports = {
  apnConnection: service,
  handleMobileNotifications
};
