const mongoose = require('mongoose');

const { Schema } = mongoose;

const FeedSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    metaPost: { type: Schema.Types.ObjectId, ref: 'metaPost' },
    tags: [{ type: String, ref: 'Tag' }],
    createdAt: { type: Date },
    read: { type: Boolean, default: false }
  },
  {
    timestamps: false
  }
);

FeedSchema.index({ userId: 1, createdAt: 1 });
FeedSchema.index({ userId: 1, createdAt: 1, tags: 1 });

FeedSchema.statics.processExpired = async function processExpired(user) {
  try {
    let updateFeed;
    const oldestUnread = await this.findOne({ userId: user, read: false })
    .sort({ createdAt: 1 })
    .limit(1);
    if (oldestUnread) {
      oldestUnread.remove();
      updateFeed = true;
    } else updateFeed = false;
    return updateFeed;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Feed', FeedSchema);
