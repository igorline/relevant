import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let RelevanceStatsSchema = new Schema({
  date: Date,
  user: { type: String, ref: 'User' },
  samples: { type: Number, default: 0 },
  aggregateRelevance: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  linkViews: { type: Number, default: 0 },
}, {
  timestamps: true
});

RelevanceStatsSchema.index({ user: 1, date: 1 });

RelevanceStatsSchema.statics.updateUserStats = async function (user, relevance) {
  try {
    let date = new Date();
    date = date.setUTCHours(0, 0, 0, 0);
    let stat = await this.findOne({ user: user._id, date });
    if (!stat) {
      stat = new this({ user: user._id, date });
    }
    stat.change += relevance;
    stat.save();
  } catch (err) {
    console.log('error updating user rel change ', err);
  }
};

module.exports = mongoose.model('RelevanceStats', RelevanceStatsSchema);
