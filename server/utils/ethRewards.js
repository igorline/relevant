import Treasury from '../api/treasury/treasury.model';
import User from '../api/user/user.model';
import Post from '../api/post/post.model';
import Invest from '../api/invest/invest.model';
import apnData from '../pushNotifications';
import Notification from '../api/notification/notification.model';
import Earnings from '../api/earnings/earnings.model';
import * as Eth from './ethereum';

import { INTERVAL_INFLAITION, INIT_COIN, SHARE_DECAY } from '../config/globalConstants';

async function initTreasury(community) {
  let treasury = new Treasury({
    lastRewardFundUpdate: new Date(),
    community
  });
  return treasury.save();
}

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


async function allocateRewards() {
  await Eth.mintRewardTokens();
  let rewardPool = await Eth.getParam('rewardPool', { noConvert: true });
  return rewardPool;
}


async function distributeRewards(community, rewardPool) {
  let treasury = await Treasury.findOne({ community });
  let now = new Date();

  let posts = await Post.find({ twitter: { $ne: true }, community, paidOut: false, payoutTime: { $lte: now } });
  let estimatePosts = await Post.find({ twitter: { $ne: true }, paidOut: false, payoutTime: { $gt: now } });

  // decay current reward shares
  let decay = (now.getTime() - treasury.lastRewardFundUpdate.getTime()) / SHARE_DECAY;
  // console.log(decay)
  // console.log('start shares ', treasury.currentShares);

  treasury.rewardFund = rewardPool;
  treasury.currentShares *= (1 - Math.min(1, decay));
  treasury.postCount *= (1 - Math.min(1, decay));
  console.log('total shares ', treasury.currentShares);
  let currentShares = 0;

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
  let { user, reward, post, treasury, type, community } = props;

  // treasury.rewardFund -= reward;
  // if (treasury.rewardFund < 0) throw new Error('Reward fund is empty!');
  // treasury = await treasury.save();
  // user.balance += reward;
  // user = await user.save();

  console.log('Awarded ', user.name, ' ', reward, ' tokens for ', post.title);

  let s = reward === 1 ? '' : 's';
  let action = type === 'vote' ? 'upvoting ' : '';
  let text = `You earned ${reward} coin${s} from ${action}this post`;
  let alertText = `You earned ${reward} coin${s} from ${action}a post`;

  await Earnings.updateRewardsRecord({
    user: user._id,
    post: post._id,
    earned: reward,
    community,
  });

  Notification.createNotification({
    post: post._id,
    forUser: user._id,
    type: 'reward',
    coin: reward,
    text,
    coinType: 'eth',
    community
  });

  apnData.sendNotification(user, alertText, {});
  return user;
}

async function distributeUserRewards(posts, community) {
  let treasury = await Treasury.findOne({ community });
  let payouts = {};
  let ethAccounts = [];
  let ethBalances = [];
  let notifications = [];
  let distributedRewards = 0;

  let updatedUsers = posts.map(async post => {
    let votes = await Invest.find({ post: post._id });
    // compute total vote shares

    let totalWeights = 0;
    votes.forEach(vote => {
      totalWeights += vote.voteWeight;
      console.log(vote.voteWeight);
    });

    console.log('totalWeights ', totalWeights);

    let author = await User.findOne({ _id: post.user }, 'name balance deviceTokens badge ethAddress');

    // Current code considers author as the first voter
    // alternately we can use a fixed percentage of reward
    // need to edit the way voteWeight is computed in invest.model createVote()

    // let authorShare = Math.max(AUTHOR_SHARE, author.voteWeight / totalWeights);
    // is it better to use post share or post payout?
    // let curationReward = post.payout * (1 - authorShare);

    let authorShare = 1 / totalWeights;
    let authorPayout = Math.floor(authorShare * post.payout);
    let curationReward = post.payout;

    distributedRewards += authorPayout;

    payouts[author._id] = payouts[author._id] ? payouts[author._id] + authorPayout : authorPayout;

    // TODO diff decimal
    author.balance += authorPayout / (10 ** 18);
    await author.save();

    if (authorPayout > 0) {
      // await rewardUser({ user: author, reward: authorPayout, treasury, post, community });
      notifications.push({
        user: author,
        reward: authorPayout / (10 ** 18),
        treasury,
        post,
        community
      });
      ethAccounts.push(author.ethAddress[0]);
      ethBalances.push(authorPayout);
    }


    //  ---------- Curation rewards ------------

    console.log('curationReward', curationReward);

    let updatedVotes = votes.map(async vote => {
      // don't count downvotes
      if (vote.amount <= 0) return;

      let user = await User.findOne({ _id: vote.investor }, 'name balance deviceTokens badge');

      let curationWeight = vote.voteWeight / totalWeights;
      let curationPayout = Math.floor(curationWeight * curationReward);

      distributedRewards += curationPayout;

      console.log('weight ', curationWeight);
      console.log('payout ', curationPayout);
      if (curationPayout === 0) return;

      payouts[user._id] = payouts[user._id] ? payouts[user._id] + curationPayout : curationPayout;

      // TODO diff decimal
      user.balance += curationPayout / (10 ** 18);
      await user.save();

      notifications.push({
        user,
        reward: curationPayout / (10 ** 18),
        treasury,
        post,
        type: 'vote',
        community,
      });

      ethAccounts.push(author.ethAddress[0]);
      ethBalances.push(authorPayout);
    });
    return Promise.all(updatedVotes);
  });

  await Promise.all(updatedUsers);

  // transfer amounts to distributed rewards
  console.log('distribute rewards ', distributedRewards);
  console.log('distribute rewards should be', distributedRewards);

  if (distributedRewards > 0) {
    await Eth.allocateRewards(distributedRewards);
  }

  // we'll do this individually upon request to save on gas
  // let success = await Eth.distributeRewards(ethAccounts, ethBalances);
  // if (success) {
  let sendNotes = notifications.map(async n => rewardUser(n));
  await Promise.all(sendNotes);
  // }

  let rewardPool = await Eth.getParam('rewardPool', { noConvert: true });
  let distPool = await Eth.getParam('distributedRewards', { noConvert: true });

  // console.log('distributedRewards Pool', distPool);
  console.log('Finished distributing rewards, remaining reward fund: ', rewardPool);
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
    console.log('Computing eth rewards in progress');
    return null;
  }
  computingRewards = true;
  try {
    let community = 'crypto';

    let treasury = await Treasury.findOne({ community });
    if (!treasury) treasury = await initTreasury(community);

    let rewardPool = await allocateRewards();
    let updatedPosts = await distributeRewards(community, rewardPool);
    let payouts = await distributeUserRewards(updatedPosts, community);

    let displayPosts = updatedPosts.map(p => ({
      title: p.title,
      payout: p.payout,
      payoutShare: p.payoutShare,
      relevance: p.relevance,
    }));

    console.log('\x1b[32m', 'allocated rewards ', rewardPool);
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

