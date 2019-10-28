import mongoose from 'mongoose';
import { VOTE_COST_RATIO } from 'server/config/globalConstants';
import Earnings from 'server/api/earnings/earnings.model';
import { computePostPayout } from 'app/utils/rewards';
import { computeShares } from 'app/utils/post';

const { Schema } = mongoose;
const TEST_ENV = process.env.NODE_ENV === 'test';

const InvestSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    investor: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },

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

// TODO: we should not remove the bet and only the vote
// otherwise voters before the removal of the bet will get a worse price
// alternately we can recompute everyone's shares upon removal
InvestSchema.methods.removeVote = async function removeVote({ post, user }) {
  const vote = this;
  post.data.shares -= vote.shares;
  post.data.balance = Math.max(post.data.balance - vote.stakedTokens, 0);
  const returnTokens = Math.min(user.lockedTokens, vote.stakedTokens);
  user.lockedTokens = (user.lockedTokens || 0) - returnTokens;
  // eslint-disable-next-line
  console.log('UNLOCK TOKENS', vote.stakedTokens, user.balance, user.lockedTokens);
  post.data.needsRankUpdate = true;

  post.data.totalShares -= vote.stakedTokens;
  const earning = await Earnings.findOne({ user: user._id, post: post._id });
  if (earning) {
    await earning.remove();
    earning.updateClient({ actionType: 'REMOVE_EARNING' });
  }
  await post.data.save();
  await user.save();
  await post.save();
  await vote.remove();
  return null;
};

InvestSchema.methods.placeBet = async function placeBet({
  post,
  communityId,
  stakedTokens,
  user
}) {
  let vote = this;

  user = await user.updateBalance();
  canBet({ user, post, stakedTokens });

  const shares = computeShares({ post, stakedTokens });
  const postData = await this.model('PostData').findOne({ post: post._id, communityId });

  // eslint-disable-next-line
  console.log(user.handle, 'got', shares, 'for', stakedTokens, 'staked tokens');

  user.lockedTokens += stakedTokens;

  postData.shares += shares;
  postData.balance += stakedTokens;
  postData.totalShares += stakedTokens;

  const communityInstance = await this.model('Community').findOne({ _id: communityId });
  postData.expectedPayout = computePostPayout(post.data, communityInstance);

  await user.save();
  await postData.save();
  post.data = postData;

  vote.shares += shares;
  vote.stakedTokens += stakedTokens;
  vote = await vote.save();

  post.myVote = vote;
  await post.save();
  user.updateClient();
  post.updateClient();

  await updateUserEarnings({
    user,
    post,
    vote
  });

  return vote;
};

InvestSchema.statics.createVote = async function createVote({
  post,
  communityInstance,
  community,
  communityId,
  amount,
  user
}) {
  let vote = new (this.model('Invest'))({
    investor: user._id,
    post: post._id,
    author: post.user,
    amount,
    ownPost: user._id.equals(post.user),
    community: communityInstance.slug,
    communityId: communityInstance._id,
    // TODO track parentPost && linkPost/aboutLink?
    // parentPost: post.parentPost,
    // linkPost: post.linkPost,
    payoutDate: post.data.payoutDate,
    paidOut: post.data.paidOut
  });

  vote = await vote.save();
  post.data.needsRankUpdate = true;

  // TODO - don't take into account community settings?
  const manualBet = user.notificationSettings.bet.manual && communityInstance.betEnabled;

  // If manual betting is enabled don't auto-bet
  if (manualBet || amount <= 0) return vote;

  try {
    const stakedTokens =
      Math.abs(amount) * VOTE_COST_RATIO * (user.balance + user.tokenBalance);
    if (stakedTokens > 0) {
      vote = await vote.placeBet({
        post,
        community,
        communityId,
        stakedTokens,
        user
      });
    }
  } catch (err) {
    // console.log("can't bet");
  }
  return vote;
};

async function updateUserEarnings({ user, post, vote }) {
  const lookup = { user: user._id, post: post._id, communityId: vote.communityId };
  const earningExists = await Earnings.countDocuments(lookup);

  const earning = await Earnings.findOneAndUpdate(
    lookup,
    {
      shares: vote.shares,
      stakedTokens: vote.stakedTokens,
      community: vote.community,
      communityId: vote.communityId,
      payoutTime: post.data.payoutTime,
      estimatedPostPayout: post.data.expectedPayout,
      totalPostShares: post.data.shares,
      status: 'pending'
    },
    { new: true, upsert: true }
  );

  if (earningExists) return earning.updateClient({ actionType: 'UPDATE_EARNING' });
  return earning.updateClient({ actionType: 'ADD_EARNING' });
}

function canBet({ post, user, stakedTokens }) {
  const now = new Date();
  const leeway = TEST_ENV ? 1000 * 60 : 0;
  const availableBalance = user.balance + user.tokenBalance - user.lockedTokens;

  if (
    !post.parentPost &&
    stakedTokens <= availableBalance &&
    post.data.eligibleForReward &&
    !post.data.paidOut &&
    post.data.payoutTime &&
    new Date(post.data.payoutTime).getTime() + leeway > now.getTime()
  ) {
    return true;
  }

  throw new Error('You cannot bet on this post');
}

module.exports = mongoose.model('Invest', InvestSchema);
