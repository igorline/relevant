const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    follower: { type: Schema.Types.Mixed, ref: 'User' },
    following: { type: Schema.Types.Mixed, ref: 'User' },
    amount: Number,
    category: [{ type: String, ref: 'Tag' }]
  },
  {
    timestamps: true
  }
);

SubscriptionSchema.index({ following: 1, follower: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
