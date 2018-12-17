const mongoose = require('mongoose');

const { Schema } = mongoose;

const TwitterFeedSchema = new Schema(
  {
    user: { type: String, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
    rank: { type: Number, default: 0 },
    tweetDate: { type: Date },
    inTimeline: { type: Boolean, default: false }
  },
  {
    timestamps: false
  }
);

TwitterFeedSchema.index({ user: 1 });
TwitterFeedSchema.index({ post: 1 });
TwitterFeedSchema.index({ user: 1, rank: 1 });
TwitterFeedSchema.index({ user: 1, post: 1 });
TwitterFeedSchema.index({ user: 1, rank: 1, post: 1 });

module.exports = mongoose.model('TwitterFeed', TwitterFeedSchema);
