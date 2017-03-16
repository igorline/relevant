'use strict';

var Message = require('./message.model');
var User = require('../user/user.model');
import {EventEmitter} from 'events';
var MessageEvents = new EventEmitter();
var Notification = require('../notification/notification.model');
var apn = require('apn');
var apnData = require('../../pushNotifications');

exports.get = function(req, res) {
  var query = req.query;

  Message.count({ $and: [ {read: false}, {to: req.query.to} ] }, function(err, c) {
      var countObj = {
        _id: req.query.to,
        type: 'SET_MESSAGES_COUNT',
        payload: c
      }
      MessageEvents.emit('message', countObj);
  })

  Message.update({ $and: [ {read: false}, {to: req.query.to} ] }, { read: true }, { multi: true }, function (err, raw) {
    if (err) return handleError(err);
    console.log('The raw response from Mongo was ', raw);
  });

  Message.find(query).sort({ _id: -1 }).populate('to from tag', 'parents parent count _id image name relevance balance')
  .then(function(messages) {
    res.json(200, messages);
  })
  .catch(handleError(res));
};

exports.create = function(req, res) {
  var user = req.user._id;

  var messageObj = {
    to: req.body.to,
    from: req.user._id,
    text: req.body.text,
    type: req.body.type,
    tag: req.body.tag,
    read: false
  }
  var newMessage = new Message(messageObj)
  newMessage.save()
  .then(function(savedMessage) {
    savedMessage.populate('to from tag', 'parents parent count _id image name relevance balance', function(err, populated) {
      var newMessageObj = {
        _id: req.body.to,
        type: 'ADD_MESSAGE',
        payload: populated
      }
      MessageEvents.emit('message', newMessageObj);
    })
  })
  .then(function() {
    return User.findOne({_id: req.body.to})
  })
  .then(function(foundUser) {
    if (foundUser) {
      if (foundUser.deviceTokens) {
        if (foundUser.deviceTokens.length) {
          var devices = [];
          console.log(foundUser.deviceTokens, 'foundUser deviceTokens')
          foundUser.deviceTokens.forEach(function(deviceToken) {
            var newDevice = new apn.Device(deviceToken);
            devices.push(newDevice);
          })
          console.log(devices, 'devices')
          var note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600;
          note.sound = "ping.aiff";
          note.alert = req.user.name+' is thirsty';
          note.payload = {'messageFrom': req.user.name};

          apnData.apnConnection.pushNotification(note, devices);
        }
      }
    }
  })
  .then(function() {
      var dbNotificationObj = {
      post: null,
      forUser: req.body.to,
      byUser: req.user._id,
      amount: null,
      type: 'thirst',
      personal: true,
      read: false,
      tag: req.body.tag
    }
    var newDbNotification = new Notification(dbNotificationObj);
    return newDbNotification.save();
  })
  .then(function(newNotif) {
    newNotif.populate('byUser forUser post tag', function(err, populated) {
      var newNotifObj = {
        _id: req.body.to,
        type: 'ADD_ACTIVITY',
        payload: populated
      }
      MessageEvents.emit('message', newNotifObj);
      res.json(200, true)
    })
  })
};

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

exports.MessageEvents = MessageEvents;
