/* eslint no-console: 0 */
import { sendNotification as sendPushNotification } from 'server/notifications';
import Notification from 'server/api/notification/notification.model';
import Post from 'server/api/post/post.model';
import User from '../api/user/user.model';
import Invest from '../api/invest/invest.model';
import Earnings from '../api/earnings/earnings.model';
import Community from '../api/community/community.model';
import * as Eth from './ethereum';
import { SHARE_DECAY, MINIMUM_RANK, TOKEN_DECIMALS } from '../config/globalConstants';
import * as numbers from '../../app/utils/numbers';
import PostData from '../api/post/postData.model';
import computePageRank from './pagerankCompute';

const queue = require('queue');

const q = queue({ concurrency: 1 });
// const debug = process.env.NODE_ENV === 'test';
const debug = false;

let computingRewards = false;

exports.rewards = async () => {
  // safeguard
  if (computingRewards) throw new Error('computing rewards is already in progress!');
  computingRewards = true;

  let rewardPool;
  try {
    rewardPool = await allocateRewards();
    console.log('rewardPool', rewardPool); // eslint-disable;
  } catch (err) {
    console.log(err);
  }

  try {
    const communities = await Community.find({});

    // const stakedTokens = await Community.getBalances();
    const stakedTokens = await Earnings.stakedTokens();
    console.log('stakedTokens', stakedTokens);

    const totalBalance = stakedTokens.reduce((a, c) => c.stakedTokens + a, 0);
    if (totalBalance === 0) return (computingRewards = false);

    communities.forEach(community =>
      q.push(async cb => {
        community = await computeCommunityRewards(community, rewardPool, stakedTokens);
        const { updatedPosts, postPayouts } = await postRewards(community);
        const { payouts, distributedRewards } = await distributeUserRewards(
          updatedPosts,
          community
        );

        const res = {
          community: community.slug,
          payouts,
          distributedRewards,
          postPayouts
        };

        return cb(null, res);
      })
    );

    const payoutData = await new Promise((resolve, reject) => {
      const results = {};
      q.on('success', res => (results[res.community] = res));
      q.start(err => (err ? reject(err) : resolve(results)));
    });

    const totalDistributedRewards = Object.keys(payoutData).reduce(
      (result, key) => result + payoutData[key].distributedRewards,
      0
    );

    if (totalDistributedRewards > 0) {
      await Eth.allocateRewards(totalDistributedRewards);
    }

    // TODO do we need these checks?
    // const remainingRewards = await Eth.getParam('rewardPool', { noConvert: true });
    // const distPool = await Eth.getParam('distributedRewards', { noConvert: true });
    // console.log('distributedRewards Pool', distPool);
    // console.log('Finished distributing rewards, remaining reward fund: ', remainingRewards);
    const now = new Date();
    await Earnings.update(
      { payoutTime: { $lte: now }, status: 'pending' },
      { status: 'expired' },
      { multi: true }
    );

    computingRewards = false;
    return { payoutData, totalDistributedRewards };
  } catch (error) {
    console.log('rewards error', error);
    computingRewards = false;
    // return null;
    throw error;
  }
};

async function allocateRewards() {
  await Eth.mintRewardTokens();
  const rewardPool = await Eth.getParam('rewardFund', { noConvert: true });
  return rewardPool;
}

async function computeCommunityRewards(community, rewardPool, stakedTokens) {
  await computePageRank({ communityId: community._id, community: community.slug, debug });
  const reward = await communityRewardShare({ community, stakedTokens, rewardPool });

  community.rewardFund = reward;
  community = await community.save();
  return community;
}

function communityRewardShare({ community, stakedTokens, rewardPool }) {
  const totalBalance = stakedTokens.reduce((a, c) => c.stakedTokens + a, 0);
  let communityBalance = stakedTokens.find(c => c._id === community.slug);
  if (!communityBalance || !communityBalance.stakedTokens) return 0;
  communityBalance = communityBalance.stakedTokens;

  // compute portion of reward pool allocated to community
  const rewardShare = communityBalance / totalBalance;
  const rewards = rewardPool * rewardShare;

  console.log('\x1b[32m', 'Reward share of', community.slug, rewardShare);
  console.log('\x1b[32m', 'Rewards for', community.slug, rewards);
  console.log('\x1b[0m');

  return rewards;
}

async function postRewards(community) {
  const rewardPool = community.rewardFund;
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
  community.topPostShares *= 1 - Math.min(1, decay);
  community.postCount *= 1 - Math.min(1, decay);

  // add post relevance to treasury
  posts.forEach(post => {
    // cut off low-ranking posts
    if (post.pagerank > MINIMUM_RANK) {
      community.currentShares += post.pagerank;
      community.postCount += 1;
      if (post.pagerank >= community.currentShares / (community.postCount || 1)) {
        community.topPostShares += post.pagerank;
      }
    }
    post.paidOut = true;
  });

  community.lastRewardFundUpdate = now;
  community = await community.save();

  const updatedPosts = await computePostPayout({ posts, community });
  // estimates post payout
  const pendingPosts = await computePostPayout({ posts: pendingPayouts, community });
  await updatePendingEarnings(pendingPosts);

  const postPayouts = updatedPosts.map(p => ({
    title: p.post,
    payout: p.payout,
    payoutShare: p.payoutShare,
    rank: p.pagerank
  }));
  console.log('\x1b[32m', 'distributed rewards to posts', postPayouts);
  console.log('\x1b[0m');

  return { updatedPosts, postPayouts };
}

// ANALYSIS — attack scenario community with low-quality posts to bring down the average?
async function computePostPayout({ posts, community }) {
  // let posts = await Post.find({ paidOut: false, payoutTime: { $lt: now } });
  let updatedPosts = posts.map(async post => {
    const average = community.currentShares / (community.postCount || 1);

    // only reward above-average posts
    console.log('rank vs average', post.pagerank, average);
    if (post.pagerank < average) {
      post.payout = 0;
      return post.save();
    }
    // linear reward curve

    // cap rewards share at 1/20th of the fund - especially for the first rewards?
    post.payoutShare = Math.min(0.05, post.pagerank / (community.topPostShares || 1));
    post.payout = community.rewardFund * post.payoutShare;
    return post.save();
  });
  updatedPosts = await Promise.all(updatedPosts);
  return updatedPosts;
}

async function distributeUserRewards(posts, _community) {
  const { slug: community, _id: communityId } = _community;
  const payouts = {};
  let distributedRewards = 0;

  const updatedUsers = posts.map(async post => {
    const votes = await Invest.find({ post: post.post });

    // compute total vote shares
    let totalShares = 0;
    votes.forEach(vote => {
      totalShares += vote.shares;
    });

    if (totalShares === 0) return null;

    const curationReward = post.payout;

    //  ---------- Curation rewards ------------

    const updatedVotes = votes.map(async vote => {
      // don't count downvotes
      if (vote.amount < 0) return null;

      let user = await User.findOne(
        { _id: vote.investor },
        'name balance deviceTokens badge lockedTokens'
      );

      const curationWeight = vote.shares / totalShares;
      const curationPayout = Math.floor(curationWeight * curationReward);

      distributedRewards += curationPayout;

      payouts[user._id] = payouts[user._id]
        ? payouts[user._id] + curationPayout
        : curationPayout;

      // TODO diff decimal?
      const reward = Math.max(curationPayout, 0) / 10 ** 18;

      const earning = await Earnings.updateRewardsRecord({
        user: user._id,
        post: post.post,
        earned: reward,
        status: curationPayout ? 'paidout' : 'expired',
        community,
        communityId
      });

      const unlockTokens = Math.min(user.lockedTokens, earning.stakedTokens);

      user = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { balance: reward, lockedTokens: -unlockTokens } },
        { new: true }
      );

      if (curationPayout === 0) return null;

      console.log('Awarded', user.name, reward, 'tokens for', post.post);
      return sendNotification({
        user,
        reward,
        post: post.post,
        type: 'vote',
        community,
        communityId,
        postData: post
      });
    });
    return Promise.all(updatedVotes);
  });

  await Promise.all(updatedUsers);

  // transfer amounts to distributed rewards
  console.log('total distributed rewards for', community, distributedRewards);
  console.log('\x1b[32m', payouts);
  console.log('\x1b[0m');
  return { payouts, distributedRewards };
}

async function sendNotification(props) {
  const { user, reward, post, community, communityId, type, postData } = props;
  const s = reward === 1 ? '' : 's';
  const action = type === 'vote' ? 'upvoting ' : '';

  const amount = numbers.abbreviateNumber(reward);
  const text = `You earned ${amount} coin${s} from ${action}this post`;
  const alertText = `You earned ${amount} coin${s} from ${action}a post`;

  await Notification.createNotification({
    post,
    forUser: user._id,
    type: 'reward',
    coin: reward,
    text,
    coinType: 'eth',
    community,
    communityId
  });

  const postObj = await Post.findOne({ _id: post });
  postObj.data = postData;

  const payload = {
    toUser: user,
    post: postObj,
    action: alertText,
    noteType: 'reward'
  };

  sendPushNotification(user, alertText, payload);
  return user;
}

async function updatePendingEarnings(posts) {
  posts = await posts.map(post =>
    Earnings.update(
      { post: post.post },
      { estimatedPostPayout: post.payout / TOKEN_DECIMALS },
      { multi: true }
    )
  );
  return Promise.all(posts);
}
