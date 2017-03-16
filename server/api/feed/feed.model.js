
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let FeedSchema = new Schema({
  userId: { type: String, ref: 'User' },
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

module.exports = mongoose.model('Feed', FeedSchema);
