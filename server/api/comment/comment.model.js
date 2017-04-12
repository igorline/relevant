import { EventEmitter } from 'events';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CommentSchema = new Schema({
  user: { type: String, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  text: String,
  tags: [{ type: String, ref: 'Tag' }],
  repost: { type: Boolean, default: false },
  mentions: [{ type: String, ref: 'User' }],
  embeddedUser: {
    name: String,
    image: String
  }
}, {
  timestamps: true
});

CommentSchema.index({ userId: 1, createdAt: -1, tags: 1 });

CommentSchema.statics.events = new EventEmitter();

CommentSchema.pre('remove', function (next) {
  this.model('Notification').remove({ comment: this._id }, next);
  // this.model('Post').update(
  //   { _id: { $in: this.post } },
  //   { $pull: { comments: this._id }, $inc: { commentCount: -1 } },
  //   { multi: true },
  //   next
  // );
});

CommentSchema.methods.updateClient = function (user) {
  if (this.user._id) this.user = this.user._id;
  let commentNote = {
    _id: user ? user._id : null,
    type: 'UPDATE_COMMENT',
    payload: { data: this },
  };
  this.model('Comment').events.emit('commentEvent', commentNote);
};

module.exports = mongoose.model('Comment', CommentSchema);
