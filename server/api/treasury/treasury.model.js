let mongoose = require('mongoose');

let Schema = mongoose.Schema;


// 52.001429 weeks in a year;
// 0.00182953652311 weekly based on 10% yearly
// 0.0009615 based on 5% yearly
// 0.0002611578760678 daily

let TreasurySchema = new Schema({
  balance: { type: Number, default: 0 },
  // out: { type: Number, default: 0 },
  // in: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },

  currentShares: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },

  rewardFund: { type: Number, default: 0 },
  lastRewardFundUpdate: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model('Treasury', TreasurySchema);
