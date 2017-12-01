
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let TwitterFeedSchema = new Schema({
  user: { type: String, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
  // createdAt: { type: Date },
  // read: { type: Boolean, default: false },
  // relevance: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  tweetDate: { type: Date },
  inTimeline: { type: Boolean, default: false }
}, {
  timestamps: false
});

TwitterFeedSchema.index({ userId: 1, createdAt: 1 });
TwitterFeedSchema.index({ userId: 1, createdAt: 1, tags: 1 });


module.exports = mongoose.model('TwitterFeed', TwitterFeedSchema);
