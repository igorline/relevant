import { EventEmitter } from 'events';

let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

// TODO USE THIS
let PostDataSchema = new Schema({
  community: String,
  communityId: { type: String, ref: 'Community' },

  rank: { type: Number, default: 0 },
  rankRelevance: { type: Number, default: 0 },

  commentCount: { type: Number, default: 0 },
  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },

  paidOut: { type: Boolean, default: false },
  payoutTime: { type: Date },
  payout: { type: Number, default: 0 },
  payOutShare: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
}, {
  timestamps: true,
});


module.exports = mongoose.model('Post', PostDataSchema);
