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


CommentSchema.pre('remove', function (next) {
  this.model('Notification').remove({ comment: this._id }, next);
  // this.model('Post').update(
  //   { _id: { $in: this.post } },
  //   { $pull: { comments: this._id }, $inc: { commentCount: -1 } },
  //   { multi: true },
  //   next
  // );
});

module.exports = mongoose.model('Comment', CommentSchema);
