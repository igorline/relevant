import Treasury from '../api/treasury/treasury.model';
import User from '../api/user/user.model';
import Post from '../api/post/post.model';
import Invest from '../api/invest/invest.model';
import apnData from '../pushNotifications';
import Notification from '../api/notification/notification.model';
import Earnings from '../api/earnings/earnings.model';

import { INTERVAL_INFLAITION, INIT_COIN, SHARE_DECAY } from '../config/globalConstants';

async function createCoins(community) {
  let treasury = await Treasury.findOne({ community });
  let outstanding = 0;
  let users = await User.find({});
  users.forEach(u => outstanding += u.balance);
  treasury.balance = INIT_COIN - outstanding;
  treasury.totalTokens = INIT_COIN;
  treasury.currentShares = 0;
  treasury.rewardFund = 0;
  treasury.postCount = 0;
  treasury.lastRewardFundUpdate = new Date();
  treasury = await treasury.save();
  console.log(treasury);
  return treasury;
}

async function getUserBalances() {
  let outstanding = 0;
  let users = await User.find({});
  users.forEach(u => outstanding += u.balance);
  console.log('total outstanding coins ', outstanding);
}

// getUserBalances();
// function init() {
//   let community = 'relevant'
//   createCoins(community)
//   .catch(err => console.log(err));
// }
// init();


async function computePostPayout(posts, treasury) {
  // let posts = await Post.find({ paidOut: false, payoutTime: { $lt: now } });
  let updatedPosts = posts.map(async post => {
    // posts w negative relevance don't get rewards
    if (post.relevance <= 0) {
      return post.save();
    }
    // linear reward curve
    post.payoutShare = post.relevance / treasury.currentShares;
    post.payout = post.balance + treasury.rewardFund * post.payoutShare;
    post.balance = 0;
    return post.save();
  });
  updatedPosts = await Promise.all(updatedPosts);
  return updatedPosts;
}


async function allocateRewards(community) {
  let treasury = await Treasury.findOne({ community });
  let newTokens = INTERVAL_INFLAITION * treasury.totalTokens;
  treasury.totalTokens += newTokens;
  treasury.rewardFund += newTokens;
  return treasury.save();
}


async function distributeRewards(community) {
  let treasury = await Treasury.findOne({ community });
  let now = new Date();

  let posts = await Post.find({ twitter: { $ne: true }, community: 'relevant', paidOut: false, payoutTime: { $lte: now } });
  let estimatePosts = await Post.find({ twitter: { $ne: true }, paidOut: false, payoutTime: { $gt: now } });

  // decay current reward shares
  let decay = (now.getTime() - treasury.lastRewardFundUpdate.getTime()) / SHARE_DECAY;
  // console.log(decay)
  // console.log('start shares ', treasury.currentShares);

  treasury.currentShares *= (1 - Math.min(1, decay));
  treasury.postCount *= (1 - Math.min(1, decay));
  // console.log('end shares ', treasury.currentShares);


  // add post relevance to treasury
  posts.forEach(post => {
    if (post.relevance > 0) {
      treasury.currentShares += post.relevance;
      treasury.postCount += 1;
      console.log('average post shares ', treasury.currentShares / treasury.postCount);
    }
    post.paidOut = true;
  });

  treasury.lastRewardFundUpdate = now;
  treasury = await treasury.save();

  let updatedPosts = await computePostPayout(posts, treasury);
  estimatePosts = await computePostPayout(estimatePosts, treasury);

  return updatedPosts;
}

async function rewardUser(props) {
  let { user, reward, post, treasury, type } = props;

  treasury.rewardFund -= reward;
  if (treasury.rewardFund < 0) throw new Error('Reward fund is empty!');
  treasury = await treasury.save();
  user.balance += reward;
  user = await user.save();

  console.log('Awarded ', user.name, ' ', reward, ' tokens for ', post.title);

  let s = reward === 1 ? '' : 's';
  let action = type === 'vote' ? 'upvoting ' : '';
  let text = `You earned ${reward} coin${s} from ${action}this post`;
  let alertText = `You earned ${reward} coin${s} from ${action}a post`;

  await Earnings.updateRewardsRecord({
    user: user._id,
    post: post._id,
    earned: reward,
  });

  Notification.createNotification({
    post: post._id,
    forUser: user._id,
    type: 'reward',
    coin: reward,
    text
  });

  apnData.sendNotification(user, alertText, {});
  return user;
}

async function distributeUserRewards(posts, community) {
  let treasury = await Treasury.findOne({ community });
  let payouts = {};
  let updatedUsers = posts.map(async post => {
    let votes = await Invest.find({ post: post._id });
    // compute total vote shares

    let totalWeights = 0;
    votes.forEach(vote => {
      totalWeights += vote.voteWeight;
      console.log(vote.voteWeight);
    });

    console.log('totalWeights ', totalWeights);

    let author = await User.findOne({ _id: post.user }, 'name balance deviceTokens badge');

    // Current code reards author as the first voter
    // alternately we can use a fixed percentage of reward
    // need to edit the way voteWeight is computed in invest.model createVote()

    // let authorShare = Math.max(AUTHOR_SHARE, author.voteWeight / totalWeights);
    // is it better to use post share or post payout?
    // let curationReward = post.payout * (1 - authorShare);

    let authorShare = 1 / totalWeights;
    let authorPayout = Math.floor(authorShare * post.payout);
    let curationReward = post.payout;

    payouts[author._id] = payouts[author._id] ? payouts[author._id] + authorPayout : authorPayout;

    if (authorPayout > 0) {
      await rewardUser({ user: author, reward: authorPayout, treasury, post });
    }


    //  ---------- Curation rewards ------------

    console.log('curationReward', curationReward);


    let updatedVotes = votes.map(async vote => {
      // don't count downvotes
      if (vote.amount <= 0) return;

      let user = await User.findOne({ _id: vote.investor }, 'name balance deviceTokens badge');

      let curationWeight = vote.voteWeight / totalWeights;
      let curationPayout = Math.floor(curationWeight * curationReward);

      console.log('weight ', curationWeight);
      console.log('payout ', curationPayout);
      if (curationPayout === 0) return;

      payouts[user._id] = payouts[user._id] ? payouts[user._id] + curationPayout : curationPayout;

      await rewardUser({ user, reward: curationPayout, treasury, post, type: 'vote' });
    });
    updatedVotes = await Promise.all(updatedVotes);
    return updatedVotes;
  });

  await Promise.all(updatedUsers);
  console.log('Finished distributing rewards, remaining reward fund: ', treasury.rewardFund);

  return payouts;
}

// exports.pendingUserReward(userId) {
//   let now = new Date();
//   let votes = await Invest.find({ payoutDate: { $lt: now } });
// }
//

let computingRewards = false;
exports.rewards = async () => {
  // safeguard
  if (computingRewards) {
    console.log('Computing rewards in progress');
    return null;
  }
  computingRewards = true;
  try {
    let community = 'relevant';
    let rewardsAllocation = await allocateRewards(community);
    let updatedPosts = await distributeRewards(community);
    let payouts = await distributeUserRewards(updatedPosts, community);

    let displayPosts = updatedPosts.map(p => ({
      title: p.title,
      payout: p.payout,
      payoutShare: p.payoutShare,
      relevance: p.relevance,
    }));
    console.log('\x1b[32m', 'allocated rewards ', rewardsAllocation);
    console.log('\x1b[32m', 'distributed rewards to posts ', displayPosts);
    console.log('\x1b[32m', payouts);
    console.log('\x1b[0m');
    computingRewards = false;
    return payouts;
  } catch (error) {
    console.log('rewards error', error);
    return null;
  }
};

