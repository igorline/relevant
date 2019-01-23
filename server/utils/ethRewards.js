import User from '../api/user/user.model';
import Invest from '../api/invest/invest.model';
import apnData from '../pushNotifications';
import Notification from '../api/notification/notification.model';
import Earnings from '../api/earnings/earnings.model';
import Community from '../api/community/community.model';
import * as Eth from './ethereum';
import { SHARE_DECAY, MINIMUM_RANK } from '../config/globalConstants';
import * as numbers from '../../app/utils/numbers';
import PostData from '../api/post/postData.model';
import computePageRank from './pagerankCompute';

/* eslint no-console: 0 */

const queue = require('queue');

const q = queue({ concurrency: 1 });

let totalDistributedRewards;

// ANALYSIS — attack scenario community with low-quality posts to bring down the average?
async function computePostPayout(posts, community) {
  // let posts = await Post.find({ paidOut: false, payoutTime: { $lt: now } });
  let updatedPosts = posts.map(async post => {
    const average = community.currentShares / community.postCount;

    // only reward above-average posts
    console.log('rank vs average ', post.pagerank, average);
    if (post.pagerank < average) {
      post.payout = 0;
      return post.save();
    }
    // linear reward curve
    post.payoutShare = post.pagerank / (community.topPostShares || 1);
    post.payout = community.rewardFund * post.payoutShare;
    return post.save();
  });
  updatedPosts = await Promise.all(updatedPosts);
  return updatedPosts;
}

async function allocateRewards() {
  await Eth.mintRewardTokens();
  const rewardPool = await Eth.getParam('rewardPool', { noConvert: true });
  return rewardPool;
}

async function distributeRewards(community, rewardPool) {
  // let treasury = await Treasury.findOne({ community });
  const now = new Date();

  // use postData as post
  const posts = await PostData.find({
    eligibleForReward: true,
    paidOut: false,
    payoutTime: { $lte: now },
    communityId: community._id
  });

  const pendingPayouts = await PostData.find({
    eligibleForReward: true,
    paidOut: false,
    payoutTime: { $gt: now },
    communityId: community._id
  });

  // decay current reward shares
  const decay = (now.getTime() - community.lastRewardFundUpdate.getTime()) / SHARE_DECAY;

  community.rewardFund = rewardPool;
  community.currentShares *= 1 - Math.min(1, decay);
  community.postCount *= 1 - Math.min(1, decay);
  console.log('total shares ', community.currentShares);

  // add post relevance to treasury
  posts.forEach(post => {
    // cut off low-ranking posts
    if (post.pagerank > MINIMUM_RANK) {
      community.currentShares += post.pagerank;
      community.postCount += 1;
      if (post.pagerank >= community.currentShares / community.postCount) {
        community.topPostShares += post.pagerank;
      }
      console.log('average post shares ', community.currentShares / community.postCount);
    }
    post.paidOut = true;
  });

  community.lastRewardFundUpdate = now;
  community = await community.save();

  const updatedPosts = await computePostPayout(posts, community);
  // estimates post payout
  await computePostPayout(pendingPayouts, community);

  return updatedPosts;
}

async function rewardUser(props) {
  const { user, reward, post, community, communityId, type } = props;

  // do we need checks against reward fund? don't think so since it comes from smart contract
  // treasury.rewardFund -= reward;
  // if (treasury.rewardFund < 0) throw new Error('Reward fund is empty!');
  // treasury = await treasury.save();
  // user.balance += reward;
  // user = await user.save();

  console.log('Awarded ', user.name, ' ', reward, ' tokens for ', post);

  const s = reward === 1 ? '' : 's';
  const action = type === 'vote' ? 'upvoting ' : '';

  const amount = numbers.abbreviateNumber(reward);
  // let amount = reward;
  const text = `You earned ${amount} coin${s} from ${action}this post`;
  const alertText = `You earned ${amount} coin${s} from ${action}a post`;
  console.log(text);

  await Earnings.updateRewardsRecord({
    user: user._id,
    post,
    earned: reward,
    status: 'paidout',
    community,
    communityId,
  });

  Notification.createNotification({
    post,
    forUser: user._id,
    type: 'reward',
    coin: reward,
    text,
    coinType: 'eth',
    community,
    communityId
  });

  apnData.sendNotification(user, alertText, {});
  return user;
}

async function distributeUserRewards(posts, community) {
  const { slug, communityId } = community;
  const payouts = {};
  const notifications = [];
  let distributedRewards = 0;

  const updatedUsers = posts.map(async post => {
    const votes = await Invest.find({ post: post.post });
    // compute total vote shares

    let totalShares = 0;
    votes.forEach(vote => {
      totalShares += vote.shares;
    });

    if (totalShares === 0) {
      return null;
    }

    console.log('totalShares ', totalShares);
    console.log('post shares ', post.shares);
    const curationReward = post.payout;

    //  ---------- Curation rewards ------------

    console.log('curationReward', curationReward);

    const updatedVotes = votes.map(async vote => {
      // don't count downvotes
      if (vote.amount < 0) return;

      const user = await User.findOne(
        { _id: vote.investor },
        'name balance deviceTokens badge'
      );

      const curationWeight = vote.shares / totalShares;
      const curationPayout = Math.floor(curationWeight * curationReward);

      distributedRewards += curationPayout;

      console.log('weight ', curationWeight);
      console.log('payout ', curationPayout);
      if (curationPayout === 0) return;

      payouts[user._id] = payouts[user._id]
        ? payouts[user._id] + curationPayout
        : curationPayout;

      // TODO diff decimal
      user.balance += curationPayout / 10 ** 18;
      await user.save();

      notifications.push({
        user,
        reward: curationPayout / 10 ** 18,
        // treasury,
        post: post.post,
        type: 'vote',
        community: slug,
        communityId,
      });
    });
    return Promise.all(updatedVotes);
  });

  await Promise.all(updatedUsers);

  // transfer amounts to distributed rewards
  console.log('distribute rewards ', distributedRewards);
  console.log('distribute rewards should be', distributedRewards);

  // we'll do this individually upon request to save on gas
  const sendNotes = notifications.map(async n => rewardUser(n));
  await Promise.all(sendNotes);

  totalDistributedRewards += distributedRewards;

  return payouts;
}

// exports.pendingUserReward(userId) {
//   let now = new Date();
//   let votes = await Invest.find({ payoutDate: { $lt: now } });
// }
//

async function computeCommunityRewards(community, _rewardPool, balances) {
  await computePageRank({ communityId: community._id, community: community.slug });

  const totalBalance = balances.reduce((a, c) => c.balance + a, 0);
  const communityBalance = balances.find(c => c._id === community.slug).balance;

  // compute portion of reward pool allocated to community
  const communityRewardPool = (_rewardPool * communityBalance) / totalBalance;

  console.log('Rewards for ', community.slug, ' ', communityRewardPool);

  const updatedPosts = await distributeRewards(community, communityRewardPool);
  const payouts = await distributeUserRewards(updatedPosts, community);

  const displayPosts = updatedPosts.map(p => ({
    title: p.post,
    payout: p.payout,
    payoutShare: p.payoutShare,
    rank: p.pagerank
  }));

  console.log(
    '\x1b[32m',
    'allocated rewards to ',
    community.slug,
    ' ',
    communityRewardPool
  );
  console.log('\x1b[32m', 'distributed rewards to posts ', displayPosts);
  console.log('\x1b[32m', payouts);
  console.log('\x1b[0m');
  return payouts;
}

let computingRewards = false;

exports.rewards = async () => {
  // safeguard
  if (computingRewards) {
    throw new Error('computing rewards is already in progress!');
  }
  computingRewards = true;
  try {
    totalDistributedRewards = 0;
    let communities = await Community.find({});
    let rewardPool = await allocateRewards();
    const balances = await Community.getBalances();
    communities.forEach(c =>
      q.push(async cb => {
        try {
          const res = await computeCommunityRewards(c, rewardPool, balances);
          return cb(null, res);
        } catch (err) {
          throw new Error(err);
        }
      })
    );

    // start loop
    communities = await new Promise((resolve, reject) =>
      q.start((err, results) => {
        if (err) reject(err);
        resolve(results);
      })
    );
    computingRewards = false;

    if (totalDistributedRewards > 0) {
      await Eth.allocateRewards(totalDistributedRewards);
    }

    rewardPool = await Eth.getParam('rewardPool', { noConvert: true });
    await Eth.getParam('distributedRewards', { noConvert: true });

    // console.log('distributedRewards Pool', distPool);
    console.log('Finished distributing rewards, remaining reward fund: ', rewardPool);

    return communities;
  } catch (error) {
    console.log('rewards error', error);
    computingRewards = true;
    return null;
  }
};
