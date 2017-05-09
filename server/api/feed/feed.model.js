
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let FeedSchema = new Schema({
  userId: { type: String, ref: 'User' },
  from: { type: String, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  metaPost: { type: Schema.Types.ObjectId, ref: 'metaPost' },
  tags: [{ type: String, ref: 'Tag' }],
  createdAt: { type: Date },
  read: { type: Boolean, default: false }
}, {
  timestamps: false
});

FeedSchema.index({ userId: 1, createdAt: 1 });
FeedSchema.index({ userId: 1, createdAt: 1, tags: 1 });

FeedSchema.statics.processExpired = async function (user) {
  let updateFeed;
  try {
    let oldestUnread = await this.findOne({ userId: user, read: false })
    .sort({ createdAt: 1 })
    .limit(1);
    console.log(oldestUnread);
    if (oldestUnread) {
      oldestUnread.remove();
      updateFeed = true;
    } else updateFeed = false;
  } catch (err) {
    console.log(err);
  }
  return updateFeed;
};

module.exports = mongoose.model('Feed', FeedSchema);
