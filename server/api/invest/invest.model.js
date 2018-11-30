import mongoose from 'mongoose';
import { EventEmitter } from 'events';
import { VOTE_COST_RATIO, SLOPE, EXPONENT } from '../../config/globalConstants';
import Earnigns from '../earnings/earnings.model';

const InvestSchemaEvents = new EventEmitter();
let Schema = mongoose.Schema;

let InvestSchema = new Schema({
  investor: { type: String, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  poster: { type: String, ref: 'User' },
  author: { type: String, ref: 'User' },
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
  lastInvestor: { type: String, ref: 'User' },
  partialUsers: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  partialRelevance: { type: Number, default: 0 },
}, {
  timestamps: true
});


// InvestSchema.index({ community: 1 });
InvestSchema.index({ post: 1 });
InvestSchema.index({ investor: 1 });
InvestSchema.index({ communityId: 1, investor: 1 });
InvestSchema.index({ communityId: 1, investor: 1, createdAt: 1 });
InvestSchema.index({ post: 1, investor: 1, ownPost: 1 });
InvestSchema.index({ post: 1, investor: 1, communityId: 1 });

InvestSchema.statics.events = InvestSchemaEvents;

InvestSchema.statics.createVote = async function createVote(props) {
  let { user, post, relevanceToAdd, amount, investment, community, communityId } = props;

  // undo investment
  if (investment) {
    // TODO remove notification
    if (amount > 0) {
      post.data.shares -= investment.shares;
      post.data.balance -= investment.stakedTokens;
    }
    post.data.totalStaked -= investment.stakedTokens;
    await investment.remove();
    return investment;
  }

  user = user.updatePower();
  user = await user.updateBalance();
  let userBalance = user.balance + user.tokenBalance;
  console.log(user.handle, 'balance', userBalance);

  let shares = 0;
  // TODO analyze ways to get around this via sybil nodes
  let votePower = user.votePower;
  amount *= votePower;

  // compute tokens allocated to this specific community
  let communityMember = await this.model('CommunityMember').findOne({ user: user._id, community: post.community }, 'weight');
  userBalance *= communityMember.weight;

  console.log('vote power ', votePower);
  let stakedTokens = userBalance * Math.abs(amount) * VOTE_COST_RATIO;
  console.log('user balance', userBalance);
  console.log('staked tokens', stakedTokens);
  console.log('post.data.balance', post.data.balance);
  console.log('amount ', amount);

  // TODO downvotes!
  let sign = 1;
  if (amount !== 0) sign = Math.abs(amount) / amount;

  // only compute shares for upvotes
  // for downvotes only track staked tokens
  // we can use totalStaked to rank by stake
  if (amount > 0) {
    let nexp = EXPONENT + 1;
    shares = ((post.data.balance + stakedTokens) / SLOPE * nexp) ** (1 / nexp) - (post.data.shares || 0);
    console.log(user.handle, ' got ', shares, ' for ', stakedTokens, ' staked tokens ');

    shares *= sign;
    stakedTokens *= sign;

    post.data.shares += shares;
    post.data.balance += stakedTokens;
  }

  post.data.totalStaked += stakedTokens;
  await post.data.save();

  investment = await this.findOneAndUpdate(
    {
      investor: user._id,
      post: post._id
    },
    {
      investor: user._id,
      author: post.user,
      amount,
      relevantPoints: relevanceToAdd,
      post: post._id,
      ownPost: post.user === user._id,
      shares,
      stakedTokens,
      community,
      communityId,
      // TODO track parentPost && linkPost/aboutLink?
      // parentPost: post.parentPost,
      // linkPost: post.linkPost,
      payoutDate: post.data.payoutDate,
      paidOut: post.data.paidOut,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return investment;
};


/**
 * DEPRECATED - NOT USED WITH PAGERANK
 * When the amount is not a whole number, we save add up the increments and save the list of users
 * once we reach a whole number we send the update to the user
 */
InvestSchema.statics.updateUserInvestment = async function updateEarnings(
  user, investor, post, relevance, amount) {
  let earnings;
  let fromUser;
  let totalUsers;
  try {
    earnings = await this.findOne({ investor: investor._id, post: post._id });

    if (!earnings) {
      // DEPRECATED should never be called,
      // but should check and update older posts
      earnings = new this({
        investor: investor._id,
        post: post._id,
        author: post.user,
        relevance: 0,
        partialRelevance: 0,
        partialUsers: 0,
        ownPost: investor._id === post.user,
        amount: 0,
        relevantPoints: 0,
      });
    }

    // TODO do we want to filter out all negative relevance here?
    if (amount > 0) {
      earnings.lastInvestor = user._id;
    } else {
      earnings.lastInvestor = user._id;
    }

    if (Math.abs(relevance) < 1) {
      earnings.partialRelevance += relevance;
      earnings.partialUsers += 1;
      relevance = 0;

      if (Math.abs(earnings.partialRelevance) >= 1) {
        relevance = Math.round(earnings.partialRelevance);
        earnings.partialRelevance -= relevance;
        earnings.relevance += relevance;
        totalUsers = earnings.partialUsers;
        earnings.partialUsers = 0;
        fromUser = earnings.lastInvestor;
      }
    } else {
      relevance = Math.round(relevance);
      earnings.relevance += relevance;
      totalUsers = 1;
      fromUser = earnings.lastInvestor;
    }

    this.model('RelevanceStats').updateUserStats(investor, relevance);

    // updates amount earned by user from post
    earnings = await earnings.save();

    // console.log(earnings.investor, ' ', earnings.partialRelevance, ' ', relevance);

    if (Math.abs(relevance) >= 1) {
      let earningsEvent = {
        _id: user._id,
        type: 'UPDATE_EARNINGS',
        payload: [earnings]
      };
      this.events.emit('investEvent', earningsEvent);
    }
  } catch (err) {
    console.log('update user invest error ', err);
    console.log(earnings);
  }
  return {
    relevance,
    fromUser,
    totalUsers
  };
};


module.exports = mongoose.model('Invest', InvestSchema);

