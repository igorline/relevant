/* eslint no-console: 0 */
import mongoose from 'mongoose';
import { EventEmitter } from 'events';
import { VOTE_COST_RATIO, SLOPE, EXPONENT } from '../../config/globalConstants';

const InvestSchemaEvents = new EventEmitter();
const { Schema } = mongoose;

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

InvestSchema.statics.events = InvestSchemaEvents;

InvestSchema.statics.createVote = async function createVote(props) {
  const { post, relevanceToAdd, community, communityId } = props;
  let { user, amount, investment } = props;

  user = user.updatePower();
  user = await user.updateBalance();
  let userBalance = user.balance + user.tokenBalance;


  investment = await this.findOne({ investor: user._id, post: post._id });
  // undo investment
  if (investment) {
    // TODO remove notification
    if (amount > 0) {
      post.data.shares -= investment.shares;
      post.data.balance = Math.max(post.data.balance - investment.stakedTokens, 0);
      const returnTokens = Math.min(user.lockedTokens, investment.stakedTokens);
      user.lockedTokens = (user.lockedTokens || 0) - returnTokens;
      user.balance += returnTokens;
      console.log('ADD TO BALANCE ', investment.stakedTokens, user.balance, user.lockedTokens);

      post.data.totalStaked -= investment.stakedTokens;
      const earning = await this.model('Earnings').findOne({ user: user._id, post: post._id });
      if (earning) await earning.remove();
      await user.save();
      await post.save();
      await investment.remove();
    }
    return investment;
  }


  let shares = 0;
  let stakedTokens = 0;
  // TODO analyze ways to get around this via sybil nodes
  const { votePower } = user;
  amount *= votePower;

  // console.log('post should have community ', post.toObject());
  // compute tokens allocated to this specific community
  const communityMember = await this.model('CommunityMember').findOne(
    { user: user._id, communityId },
    'weight'
  );
  userBalance *= communityMember.weight;

  console.log('vote power ', votePower);
  console.log('user balance', userBalance);
  console.log('staked tokens', stakedTokens);
  console.log('post.data.balance', post.data.balance);
  console.log('amount ', amount);


  // only compute shares for upvotes
  // for downvotes only track staked tokens
  // we can use totalStaked to rank by stake
  // only stake on top-level posts!!!!
  if (amount > 0 && !post.postParent) {
    const { balance, shares: postShares } = post.data;
    const nexp = EXPONENT + 1;
    stakedTokens = userBalance * Math.abs(amount) * VOTE_COST_RATIO;
    shares =
      (((Math.max(balance, 0) + stakedTokens) / SLOPE) * nexp) ** (1 / nexp) - (postShares || 0);
    console.log(user.handle, ' got ', shares, ' for ', stakedTokens, ' staked tokens ');
  }

  // should we stake for downvotes?
  // if (amount < 0 && !post.postParent) {
  //   // payout?
  //   stakedTokens = userBalance * Math.abs(amount) * VOTE_COST_RATIO;
  // }

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


  post.data.shares += shares;
  post.data.balance += stakedTokens;
  user.lockedTokens += stakedTokens;
  user.balance -= stakedTokens;
  post.data.totalStaked += stakedTokens;
  console.log('SUBTRACT FROM BALANCE ', stakedTokens, 'balance:', user.balance, 'locked:', user.lockedTokens);
  await user.save();
  await post.data.save();

  if (amount > 0) {
    const earning = await this.model('Earnings').findOneAndUpdate(
      { user: user._id, post: post._id },
      {
        shares,
        stakedTokens,
        community,
        communityId,
        status: 'pending'
      },
      { new: true, upsert: true }
    );
    earning.updateClient({ actionType: 'ADD_EARNING' });
  }

  return investment;
};

module.exports = mongoose.model('Invest', InvestSchema);
