import mongoose from 'mongoose';
import { EventEmitter } from 'events';

const { Schema } = mongoose;
const EarningsSchemaEvents = new EventEmitter();

const EarningsSchema = new Schema(
  {
    user: { type: Schema.Types.Mixed, ref: 'User' },
    source: { type: String, default: 'post' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    // amount: { type: Number, default: 0 },
    // spent: { type: Number, default: 0 },
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
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' }
  },
  {
    timestamps: true
  }
);

EarningsSchema.index({ post: 1 });
EarningsSchema.index({ status: 1 });
EarningsSchema.index({ user: 1, status: 1 });
EarningsSchema.index({ user: 1, post: 1 });

EarningsSchema.statics.events = EarningsSchemaEvents;

EarningsSchema.statics.updateRewardsRecord = async function updateRewardsRecord(earning) {
  try {
    const updatedEarning = await this.findOneAndUpdate(
      { user: earning.user, post: earning.post },
      { ...earning },
      { new: true, upsert: true }
    );
    updatedEarning.updateClient({ actionType: 'UPDATE_EARNING' });
    return updatedEarning;
  } catch (err) {
    throw err;
  }
};

EarningsSchema.methods.updateClient = function updateClient({ actionType }) {
  const earningsAction = {
    _id: this.user,
    type: actionType,
    payload: this
  };
  this.model('Earnings').events.emit('earningsEvent', earningsAction);
};

EarningsSchema.pre('remove', async function preRemove(next) {
  try {
    this.updateClient({ actionType: 'REMOVE_EARNING' });
    next();
  } catch (err) {
    throw err;
  }
});

EarningsSchema.statics.updateUserBalance = async function updateBalance(earning) {
  try {
    earning = new this(earning);
    earning = await earning.save();
    return earning;
  } catch (err) {
    throw err;
  }
};

EarningsSchema.statics.updateEarnings = async function updateEarnings({
  post,
  communityId
}) {
  if (!post.data) {
    post.data = await this.model('PostData').find({ post: post._id, communityId });
  }
  await this.model('Earnings').update(
    { post: post._id, communityId },
    {
      estimatedPostPayout: post.data.expectedPayout,
      totalPostShares: post.data.shares
    },
    { multi: true }
  );
  const earnings = await this.find({ post: post._id, communityId });
  earnings.forEach(e => e.updateClient({ actionType: 'ADD_EARNING' }));
  return earnings;
};

EarningsSchema.statics.stakedTokens = async function stakedTokens() {
  try {
    // this.model('CommunityMember').find({}).then(console.log);
    return await this.model('Earnings').aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$community',
          stakedTokens: { $sum: '$stakedTokens' }
        }
      }
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Earnings', EarningsSchema);
