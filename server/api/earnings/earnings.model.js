import mongoose from 'mongoose';
import socketEvent from 'server/socket/socketEvent';

const { Schema } = mongoose;

const EarningsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, default: 'post' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    // amount: { type: Number, default: 0 },
    // spent is legacy code keep in case we need to recompute legacy tokens
    spent: { type: Number, default: 0 },
    // pending: { type: Number, default: 0 },
    stakedTokens: { type: Number, default: 0 },
    totalPostShares: { type: Number, default: 0 },
    estimatedPostPayout: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    payoutTime: Date,
    status: String,
    type: { type: String, default: 'coins' },
    community: { type: String },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },

    cashOutAttempt: { type: Schema.Types.Boolean, default: false },
    cashOutAmt: { type: Number, default: 0 },

    prevBalance: { type: Number, default: 0 },
    endBalance: { type: Number, default: 0 },

    totalPreviousPaidout: { type: Number, default: 0 },
    legacyAirdrop: { type: Number, default: 0 },
    referralTokens: { type: Number, default: 0 },
    airdropTokens: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

EarningsSchema.index({ post: 1 });
EarningsSchema.index({ status: 1 });
EarningsSchema.index({ user: 1, status: 1 });
EarningsSchema.index({ user: 1, post: 1 });

EarningsSchema.statics.updateRewardsRecord = async function updateRewardsRecord(earning) {
  const updatedEarning = await this.findOneAndUpdate(
    { user: earning.user, post: earning.post, communityId: earning.communityId },
    { ...earning },
    { new: true, upsert: true }
  );
  updatedEarning.updateClient({ actionType: 'UPDATE_EARNING' });
  return updatedEarning;
};

EarningsSchema.methods.updateClient = function updateClient({ actionType }) {
  const earningsAction = {
    _id: this.user,
    type: actionType,
    payload: this
  };
  socketEvent.emit('socketEvent', earningsAction);
};

EarningsSchema.pre('remove', async function preRemove(next) {
  this.updateClient({ actionType: 'REMOVE_EARNING' });
  next();
});

EarningsSchema.statics.updateUserBalance = async function updateBalance(earning) {
  earning = new this(earning);
  earning = await earning.save();
  return earning;
};

EarningsSchema.statics.updateEarnings = async function updateEarnings({
  post,
  communityId
}) {
  if (!post.data) {
    post.data = await this.model('PostData').find({ post: post._id, communityId });
  }
  await this.model('Earnings').updateMany(
    { post: post._id, communityId },
    {
      estimatedPostPayout: post.data.expectedPayout,
      totalPostShares: post.data.shares
    },
    { multi: true }
  );
  const earnings = await this.find({ post: post._id, communityId });
  earnings.forEach(e => e.updateClient({ actionType: 'UPDATE_EARNING' }));
  return earnings;
};

EarningsSchema.statics.stakedTokens = async function stakedTokens() {
  return this.model('Earnings').aggregate([
    { $match: { status: 'pending' } },
    {
      $group: {
        _id: '$community',
        stakedTokens: { $sum: '$stakedTokens' }
      }
    }
  ]);
};

module.exports = mongoose.model('Earnings', EarningsSchema);
