const mongoose = require('mongoose');

const { Schema } = mongoose;

const StaticsticsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    date: { type: Date, index: true },
    startTime: { type: Date, index: true },
    endTime: { type: Date, index: true },
    relevance: Number,
    totalSamples: Number,
    aggregateRelevance: Number,
    hours: {
      0: Number,
      1: Number,
      2: Number,
      3: Number,
      4: Number,
      5: Number,
      6: Number,
      7: Number,
      8: Number,
      9: Number,
      10: Number,
      11: Number,
      12: Number,
      13: Number,
      14: Number,
      15: Number,
      16: Number,
      17: Number,
      18: Number,
      19: Number,
      20: Number,
      21: Number,
      22: Number,
      23: Number,
      24: Number
    }
  },
  {
    timestamps: true
  }
);

StaticsticsSchema.index({ userId: 1, startTime: 1 });
StaticsticsSchema.index({ userId: 1, endTime: 1 });

module.exports = mongoose.model('Statistics', StaticsticsSchema);
