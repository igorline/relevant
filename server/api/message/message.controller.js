

import { EventEmitter } from 'events';

const Message = require('./message.model');
const User = require('../user/user.model');

const MessageEvents = new EventEmitter();
const Notification = require('../notification/notification.model');
const apn = require('apn');
const apnData = require('../../pushNotifications');

exports.get = function (req, res) {
  const query = req.query;

  Message.count({ $and: [{ read: false }, { to: req.query.to }] }, (err, c) => {
    const countObj = {
      _id: req.query.to,
      type: 'SET_MESSAGES_COUNT',
      payload: c
    };
    MessageEvents.emit('message', countObj);
  });

  Message.update({ $and: [{ read: false }, { to: req.query.to }] }, { read: true }, { multi: true }, (err, raw) => {
    if (err) return handleError(err);
    console.log('The raw response from Mongo was ', raw);
  });

  Message.find(query).sort({ _id: -1 }).populate('to from tag', 'parents parent count _id image name relevance balance')
    .then((messages) => {
      res.json(200, messages);
    })
    .catch(handleError(res));
};

exports.create = function (req, res) {
  const user = req.user._id;

  const messageObj = {
    to: req.body.to,
    from: req.user._id,
    text: req.body.text,
    type: req.body.type,
    tag: req.body.tag,
    read: false
  };
  const newMessage = new Message(messageObj);
  newMessage.save()
    .then((savedMessage) => {
      savedMessage.populate('to from tag', 'parents parent count _id image name relevance balance', (err, populated) => {
        const newMessageObj = {
          _id: req.body.to,
          type: 'ADD_MESSAGE',
          payload: populated
        };
        MessageEvents.emit('message', newMessageObj);
      });
    })
    .then(() => User.findOne({ _id: req.body.to }))
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.deviceTokens) {
          if (foundUser.deviceTokens.length) {
            const devices = [];
            console.log(foundUser.deviceTokens, 'foundUser deviceTokens');
            foundUser.deviceTokens.forEach((deviceToken) => {
              const newDevice = new apn.Device(deviceToken);
              devices.push(newDevice);
            });
            console.log(devices, 'devices');
            const note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600;
            note.sound = 'ping.aiff';
            note.alert = req.user.name + ' is thirsty';
            note.payload = { messageFrom: req.user.name };

            apnData.apnConnection.pushNotification(note, devices);
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
    .then((newNotif) => {
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

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

exports.MessageEvents = MessageEvents;
