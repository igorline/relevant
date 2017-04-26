import { EventEmitter } from 'events';

const Notification = require('./notification.model');

const NotificationEvents = new EventEmitter();

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

exports.create = (req, res) => {
  let notificationObj = req.body;

  let dbNotificationObj = {
    post: req.body.post ? req.body.post : null,
    forUser: req.body.forUser ? req.body.forUser : null,
    byUser: req.body.byUser ? req.body.byUser : null,
    amount: req.body.amount ? req.body.amount : null,
    type: req.body.type ? req.body.type : null,
    personal: req.body.personal ? req.body.personal : false,
    read: false,
    tag: req.body.tag ? req.body.tag : null
  };

  let newNotification = new Notification(dbNotificationObj);
  return newNotification.save()
  .then(newNotif => {
    let newNotifObj = {
      _id: req.body.forUser,
      type: 'ADD_ACTIVITY',
    };
    if (newNotification.personal) {
      NotificationEvents.emit('notification', newNotifObj);
    }
    res.send(200).send();
  });
};

exports.show = (req, res) => {
  let query = null;
  let userId = req.user._id;
  let skip = parseInt(req.query.skip, 10) || 0;
  let limit = 20;

  if (userId) {
    query = { $or: [
      { forUser: userId },
      { forUser: 'everyone' },
    ]
    };
  }

  // Uncomment to hide previous @everyone notifications - these maybe usefull onboarding?
  // if (req.user.createdAt) {
  //   query = { ...query, createdAt: { $gt: new Date(req.user.createdAt) } };
  // }

  Notification.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ _id: -1 })
  .populate('byUser forUser post')
  .then(notifications => res.status(200).json(notifications));
};

exports.unread = (req, res) => {
  let query = null;
  let userId = req.user._id;
  if (userId) {
    query = { forUser: userId, read: false };
  }
  Notification.count(query)
  .then((unread) => {
    res.status(200).json({ unread });
  });
};

exports.showGeneral = (req, res) => {
  let avoidUser = req.user._id;
  let skip = parseInt(req.query.skip, 10) || 0;
  let limit = 20;
  let query = { personal: false };
  if (avoidUser) query = { $and: [{ personal: false }, { byUser: { $ne: avoidUser } }] };

  Notification.find(query)
  .limit(limit)
  .skip(skip)
  .sort({ _id: -1 })
  .populate('byUser forUser post tag')
  .then(notifications => res.status(200).json(notifications));
};

exports.markRead = (req, res) => {
  let query = { forUser: req.user._id, read: false };
  return Notification.update(query, { read: true }, { multi: true })
  .then(() => res.status(200).send())
  .catch(err => handleError(res, err));
};

  // Notification.update(query, { read: true }, { multi: true }, function (err, raw) {
  //   if (err) return handleError(err);
  //   console.log('The raw response from Mongo was ', raw);
  //   res.status(200).send(true);
  // });
// }

exports.NotificationEvents = NotificationEvents;

