/* eslint no-console: 0 */
import mongoose from 'mongoose';
import { EventEmitter } from 'events';
import { VOTE_COST_RATIO, SLOPE, EXPONENT } from 'server/config/globalConstants';
// import Community from 'server/api/community/community.model';
import Earnings from 'server/api/earnings/earnings.model';
import { computePostPayout } from 'app/utils/rewards';

const InvestSchemaEvents = new EventEmitter();
const { Schema } = mongoose;

const InvestSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    investor: { type: Schema.Types.Mixed, ref: 'User' },
    author: { type: Schema.Types.Mixed, ref: 'User' },

    ownPost: { type: Boolean, default: false },
    amount: Number,

    community: String,
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    // voteWeight is DEPRECATED same as shares - shares is better
    // TODO convert this in old data
    // voteWeight: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    stakedTokens: { type: Number, default: 0 },

    paidOut: { type: Boolean, default: false },
    payoutDate: { type: Date },

    // EVERYTHING BELOW SHOULD BE REMOVED - DEPRECATED

    // vote weight
    relevantPoints: { type: Number, default: 0 },
    rankChange: { type: Number, default: 0 },

    // this info helps us determine how much the
    // investor (or author) has earned from this post
    upvotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },
    updatePowerInvestor: { type: String, ref: 'User' },
    partialUsers: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    partialRelevance: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// InvestSchema.index({ community: 1 });
InvestSchema.index({ post: 1 });
InvestSchema.index({ investor: 1 });
InvestSchema.index({ communityId: 1, investor: 1 });
InvestSchema.index({ communityId: 1, investor: 1, createdAt: 1 });
InvestSchema.index({ post: 1, investor: 1, ownPost: 1 });
InvestSchema.index({ post: 1, investor: 1, communityId: 1 });

InvestSchema.statics.events = InvestSchemaEvents;

async function undoInvest({ post, investment, user }) {
  post.data.shares -= investment.shares;
  post.data.balance = Math.max(post.data.balance - investment.stakedTokens, 0);
  const returnTokens = Math.min(user.lockedTokens, investment.stakedTokens);
  user.lockedTokens = (user.lockedTokens || 0) - returnTokens;
  console.log('UNLOCK TOKENS', investment.stakedTokens, user.balance, user.lockedTokens);

  post.data.totalStaked -= investment.stakedTokens;
  const earning = await Earnings.findOne({ user: user._id, post: post._id });
  if (earning) {
    await earning.remove();
    earning.updateClient({ actionType: 'REMOVE_EARNING' });
  }
  await user.save();
  await post.save();
  await investment.remove();
  return investment;
}

InvestSchema.statics.createVote = async function createVote(props) {
  const { post, relevanceToAdd, community, communityId, amount } = props;
  let { user, investment } = props;

  // user = user.updatePower();
  user = await user.updateBalance();
  const userBalance = user.balance + user.tokenBalance;

  investment = await this.findOne({ investor: user._id, post: post._id });
  if (investment) return undoInvest({ post, investment, user });

  let shares = 0;
  let stakedTokens = userBalance * Math.abs(amount) * VOTE_COST_RATIO;

  // can only invest in top-level posts
  let canInvest = !post.postParent && user.lockedTokens + stakedTokens <= userBalance;
  canInvest = post.data.eligibleForReward && !post.data.paidOut;

  if (!canInvest) stakedTokens = 0;
  console.log('canInvest', canInvest);

  // TODO - total tokens staked within a community instead
  const communityInstance = await this.model('Community').findOne({ _id: communityId });
  // userBalance *= communityMember.weight;

  // only compute shares for upvotes
  // for downvotes only track staked tokens
  // we can use totalStaked to rank by stake
  // only stake on top-level posts
  if (canInvest) {
    const { balance, shares: postShares } = post.data;
    const nexp = EXPONENT + 1;
    stakedTokens = userBalance * Math.abs(amount) * VOTE_COST_RATIO;
    shares =
      (((Math.max(balance, 0) + stakedTokens) / SLOPE) * nexp) ** (1 / nexp) -
      (postShares || 0);
    console.log(user.handle, 'got', shares, 'for', stakedTokens, 'staked tokens');
  }

  investment = new (this.model('Invest'))({
    investor: user._id,
    post: post._id,
    author: post.user,
    amount,
    relevantPoints: relevanceToAdd,
    ownPost: post.user === user._id,
    shares,
    stakedTokens,
    community,
    communityId,
    // TODO track parentPost && linkPost/aboutLink?
    // parentPost: post.parentPost,
    // linkPost: post.linkPost,
    payoutDate: post.data.payoutDate,
    paidOut: post.data.paidOut
  });
  await investment.save();

  if (!canInvest) return investment;

  post.data.shares += shares;
  post.data.balance += stakedTokens;
  user.lockedTokens += stakedTokens;
  post.data.totalStaked += stakedTokens;
  post.data.expectedPayout = computePostPayout(post.data, communityInstance);

  await user.save();
  await post.data.save();

  if (amount > 0) {
    await updateUserEarnings({
      user,
      post,
      shares,
      stakedTokens,
      community,
      communityId
    });
  }

  return investment;
};

async function updateUserEarnings({
  user,
  post,
  shares,
  stakedTokens,
  community,
  communityId
}) {
  const earning = await Earnings.findOneAndUpdate(
    { user: user._id, post: post._id },
    {
      shares,
      stakedTokens,
      community,
      communityId,
      payoutTime: post.data.payoutTime,
      estimatedPostPayout: post.data.expectedPayout,
      totalPostShares: post.data.shares,
      status: 'pending'
    },
    { new: true, upsert: true }
  );
  earning.updateClient({ actionType: 'ADD_EARNING' });
}

module.exports = mongoose.model('Invest', InvestSchema);
