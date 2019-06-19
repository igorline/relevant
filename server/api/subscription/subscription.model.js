const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User' },
    following: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    category: [{ type: String, ref: 'Tag' }],
    community: { type: String },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' }
  },
  {
    timestamps: true
  }
);

SubscriptionSchema.index({ following: 1, follower: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
