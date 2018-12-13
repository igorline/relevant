

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  follower: { type: String, ref: 'User' },
  following: { type: String, ref: 'User' },
  amount: Number,
  category: [{ type: String, ref: 'Tag' }],
}, {
  timestamps: true
});

SubscriptionSchema.index({ following: 1, follower: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

