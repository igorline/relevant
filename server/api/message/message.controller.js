import { EventEmitter } from 'events';

const apn = require('apn');
const notificationUtil = require('server/notifications');
const Message = require('./message.model');
const User = require('../user/user.model');

const MessageEvents = new EventEmitter();
const Notification = require('../notification/notification.model');

exports.get = (req, res, next) => {
  const { query } = req;

  Message.count({ $and: [{ read: false }, { to: req.query.to }] }, (err, c) => {
    const countObj = {
      _id: req.query.to,
      type: 'SET_MESSAGES_COUNT',
      payload: c
    };
    MessageEvents.emit('message', countObj);
  });

  Message.update(
    { $and: [{ read: false }, { to: req.query.to }] },
    { read: true },
    { multi: true },
    err => {
      if (err) return next(err);
      return null;
    }
  );

  Message.find(query)
  .sort({ _id: -1 })
  .populate('to from tag', 'parents parent count _id image name relevance balance')
  .then(messages => {
    res.json(200, messages);
  })
  .catch(next);
};

exports.create = (req, res) => {
  const messageObj = {
    to: req.body.to,
    from: req.user._id,
    text: req.body.text,
    type: req.body.type,
    tag: req.body.tag,
    read: false
  };
  const newMessage = new Message(messageObj);
  newMessage
  .save()
  .then(savedMessage => {
    savedMessage.populate(
      'to from tag',
      'parents parent count _id image name relevance balance',
      (err, populated) => {
        const newMessageObj = {
          _id: req.body.to,
          type: 'ADD_MESSAGE',
          payload: populated
        };
        MessageEvents.emit('message', newMessageObj);
      }
    );
  })
  .then(() => User.findOne({ _id: req.body.to }))
  .then(foundUser => {
    if (foundUser) {
      if (foundUser.deviceTokens) {
        if (foundUser.deviceTokens.length) {
          const devices = [];
          foundUser.deviceTokens.forEach(deviceToken => {
            const newDevice = new apn.Device(deviceToken);
            devices.push(newDevice);
          });
          const note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600;
          note.sound = 'ping.aiff';
          note.alert = req.user.name + ' is thirsty';
          note.payload = { messageFrom: req.user.name };

          notificationUtil.sendNotification(note, devices);
        }
      }
    }
  })
  .then(() => {
    const dbNotificationObj = {
      post: null,
      forUser: req.body.to,
      byUser: req.user._id,
      amount: null,
      type: 'thirst',
      personal: true,
      read: false,
      tag: req.body.tag
    };
    const newDbNotification = new Notification(dbNotificationObj);
    return newDbNotification.save();
  })
  .then(newNotif => {
    newNotif.populate('byUser forUser post tag', (err, populated) => {
      const newNotifObj = {
        _id: req.body.to,
        type: 'ADD_ACTIVITY',
        payload: populated
      };
      MessageEvents.emit('message', newNotifObj);
      res.json(200, true);
    });
  });
};

exports.MessageEvents = MessageEvents;
