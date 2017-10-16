import mongoose from 'mongoose';
import { EventEmitter } from 'events';

const Schema = mongoose.Schema;

let NotificationSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  forUser: { type: String, ref: 'User' },
  byUser: { type: String, ref: 'User' },
  byUsers: [{ type: String, ref: 'User' }],
  totalUsers: Number,
  read: { type: Boolean, default: false },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  amount: Number,
  coin: Number,
  source: { type: String, default: 'post' },
  type: String,
  personal: { type: Boolean, default: true },
  tag: { type: String, ref: 'Tag' },
  text: { type: String }
}, {
  timestamps: true
});

NotificationSchema.statics.events = new EventEmitter();

NotificationSchema.index({ forUser: 1 });
NotificationSchema.index({ forUser: 1, _id: 1 });
NotificationSchema.index({ forUser: 1, _id: 1, createdAt: 1 });

NotificationSchema.statics.createNotification = async function createNotification(
  notificationObject
  ) {
  let notification;

  try {
    notification = new this(notificationObject);
    let saveNotification = await notification.save();

    let earningNotificationEvent = {
      _id: notificationObject.forUser,
      type: 'ADD_ACTIVITY',
      payload: saveNotification
    };

    this.events.emit('notificationEvent', earningNotificationEvent);
  } catch (err) {
    console.log('error creating notificaiton ', err);
  }
  return notification;
};


NotificationSchema.pre('save', function limitNotifications(next) {
  this.model('Notification').count({ forUser: this.forUser }, (err, c) => {
    if (c >= 500) {
      this.model('Notification')
      .find({ forUser: this.forUser })
      .sort({ _id: 1 })
      .then((results) => {
        results[0].remove();
      });
      next();
    } else {
      next();
    }
  });
});


module.exports = mongoose.model('Notification', NotificationSchema);
