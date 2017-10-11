let mongoose = require('mongoose');

let Schema = mongoose.Schema;


// 52.1429 weeks in a year;
// 0.19231% weekly based on 10% yearly
// 0.09615% based on 5% yearly

let TreasurySchema = new Schema({
  balance: { type: Number, default: 0 },
  out: { type: Number, default: 0 },
  in: { type: Number, default: 0 },
  totalTokens: Number,
  // accumilatedDecay: { type: Number, default: 0 },
  // based on 10%
  weeklyPayout: Number,
  currentShares: Number,
  rewardFund: Number,
}, {
  timestamps: true
});

module.exports = mongoose.model('Treasury', TreasurySchema);
