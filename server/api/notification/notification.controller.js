import { EventEmitter } from 'events';

const Notification = require('./notification.model');

const NotificationEvents = new EventEmitter();

exports.create = (req, res, next) => {
  const dbNotificationObj = {
    post: req.body.post ? req.body.post : null,
    forUser: req.body.forUser ? req.body.forUser : null,
    byUser: req.body.byUser ? req.body.byUser : null,
    amount: req.body.amount ? req.body.amount : null,
    type: req.body.type ? req.body.type : null,
    personal: req.body.personal ? req.body.personal : false,
    read: false,
    tag: req.body.tag ? req.body.tag : null
  };

  const newNotification = new Notification(dbNotificationObj);
  return newNotification
  .save()
  .then(() => {
    const newNotifObj = {
      _id: req.body.forUser,
      type: 'ADD_ACTIVITY'
    };
    if (newNotification.personal) {
      NotificationEvents.emit('notification', newNotifObj);
    }
    res.send(200).send();
  })
  .catch(next);
};

exports.show = (req, res, next) => {
  let query = null;
  const userId = req.user._id;
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = 20;

  if (userId) {
    query = { $or: [{ forUser: userId }, { forUser: 'everyone' }] };
  }

  Notification.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ _id: -1 })
  .populate('byUser forUser post')
  .then(notifications => res.status(200).json(notifications))
  .catch(next);
};

exports.unread = (req, res, next) => {
  let query = null;
  const userId = req.user._id;
  if (userId) {
    query = { forUser: userId, read: false };
  }
  Notification.count(query)
  .then(unread => {
    res.status(200).json({ unread });
  })
  .catch(next);
};

exports.showGeneral = (req, res, next) => {
  const avoidUser = req.user._id;
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = 20;
  let query = { personal: false };
  if (avoidUser) query = { $and: [{ personal: false }, { byUser: { $ne: avoidUser } }] };

  Notification.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ _id: -1 })
  .populate('byUser forUser post tag')
  .then(notifications => res.status(200).json(notifications))
  .catch(next);
};

exports.markRead = (req, res, next) => {
  const query = { forUser: req.user._id, read: false };
  return Notification.update(query, { read: true }, { multi: true })
  .then(() => res.status(200).send())
  .catch(next);
};

exports.NotificationEvents = NotificationEvents;
