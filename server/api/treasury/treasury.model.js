let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let TreasurySchema = new Schema({
  balance: { type: Number, default: 0 },
  out: { type: Number, default: 0 },
  in: { type: Number, default: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Treasury', TreasurySchema);
