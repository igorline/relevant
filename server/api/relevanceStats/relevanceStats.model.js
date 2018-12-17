import mongoose from 'mongoose';

const { Schema } = mongoose;

const RelevanceStatsSchema = new Schema(
  {
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
    community: { type: String },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' }
  },
  {
    timestamps: true
  }
);

RelevanceStatsSchema.index({ user: 1, date: 1 });

RelevanceStatsSchema.statics.updateUserStats = async function updateUserStats(
  user,
  relevance,
  communityId
) {
  try {
    let date = new Date();
    date = date.setUTCHours(0, 0, 0, 0);
    let stat = await this.findOne({ user: user._id, date, communityId });
    if (!stat) {
      stat = new this({ user: user._id, date });
    }
    stat.change += relevance;
    stat.save();
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('RelevanceStats', RelevanceStatsSchema);
