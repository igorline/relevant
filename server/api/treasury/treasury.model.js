import mongoose from 'mongoose';

const { Schema } = mongoose;

const TreasurySchema = new Schema(
  {
    balance: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },

    currentShares: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },

    rewardFund: { type: Number, default: 0 },
    lastRewardFundUpdate: { type: Date },

    avgTwitterScore: { type: Number, default: 0 },

    twitterCount: { type: Number, default: 0 },
    lastTwitterUpdate: { type: Date },
    community: String,
    unAllocatedRewards: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Treasury', TreasurySchema);
