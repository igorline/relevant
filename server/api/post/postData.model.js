const mongoose = require('mongoose');

const { Schema } = mongoose;

// TODO USE THIS
const PostDataSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'post' },
    community: String,
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },

    eligibleForReward: { type: Boolean, default: false },

    rank: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    pagerank: { type: Number, default: 0 },
    pagerankRaw: { type: Number, default: 0 },
    relevanceNeg: { type: Number, default: 0 },

    // should we track community comments separately?
    // commentCount: { type: Number, default: 0 },
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },

    postDate: { type: Date, index: true },
    latestComment: { type: Date, index: true },

    paidOut: { type: Boolean, default: false },
    payoutTime: { type: Date },
    payout: { type: Number, default: 0 },
    payOutShare: { type: Number, default: 0 },

    shares: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 }, // track positive and negative here

    latestTweet: { type: Date }
  },
  {
    timestamps: true
  }
);

PostDataSchema.index({ post: 1 });
PostDataSchema.index({ post: 1, communityId: 1 });

module.exports = mongoose.model('PostData', PostDataSchema);
