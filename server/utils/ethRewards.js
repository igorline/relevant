import Treasury from '../api/treasury/treasury.model';
import User from '../api/user/user.model';
import Post from '../api/post/post.model';
import Invest from '../api/invest/invest.model';
import apnData from '../pushNotifications';
import Notification from '../api/notification/notification.model';
import Earnings from '../api/earnings/earnings.model';
import Community from '../api/community/community.model';
import * as Eth from './ethereum';
import { INTERVAL_INFLAITION, INIT_COIN, SHARE_DECAY } from '../config/globalConstants';
import * as numbers from '../../app/utils/numbers';
import PostData from '../api/post/postData.model';

let totalDistributedRewards;

async function computePostPayout(posts, community) {
  // let posts = await Post.find({ paidOut: false, payoutTime: { $lt: now } });
  let updatedPosts = posts.map(async post => {
    // posts w negative relevance don't get rewards
    if (post.relevance <= 0) {
      return post.save();
    }
    // linear reward curve
    post.payoutShare = post.relevance / community.currentShares;
    post.payout = community.rewardFund * post.payoutShare;
    // post.balance = 0;
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
  // let treasury = await Treasury.findOne({ community });
  let now = new Date();

  // DO all posts (not really using community here)
  // let posts = await Post.find({
  //   twitter: { $ne: true },
  //   type: 'post',
  //   paidOut: false,
  //   payoutTime: { $lte: now }
  // })
  // .populate({ path: 'data', community, paidOut: false,  payoutTime: { $lte: now } });
  // let estimatePosts = await Post.find({ twitter: { $ne: true }, type: 'post', paidOut: false, payoutTime: { $gt: now } });

  // here posts represent post data
  let posts = await PostData.find({
    eligibleForReward: true,
    paidOut: false,
    payoutTime: { $lte: now },
    communityId: community._id
  });
  // console.log('posts eligible for rewads in ', community.slug, posts);

  // decay current reward shares
  let decay = (now.getTime() - community.lastRewardFundUpdate.getTime()) / SHARE_DECAY;
  // console.log(decay)
  // console.log('start shares ', treasury.currentShares);

  community.rewardFund = rewardPool;
  community.currentShares *= (1 - Math.min(1, decay));
  community.postCount *= (1 - Math.min(1, decay));
  console.log('total shares ', community.currentShares);
  let currentShares = 0;

  // add post relevance to treasury
  posts.forEach(post => {
    if (post.relevance > 0) {
      community.currentShares += post.relevance;
      community.postCount += 1;
      console.log('average post shares ', community.currentShares / community.postCount);
    }
    post.paidOut = true;
  });

  community.lastRewardFundUpdate = now;
  community = await community.save();

  let updatedPosts = await computePostPayout(posts, community);
  // estimatePosts = await computePostPayout(estimatePosts, community);

  return updatedPosts;
}

async function rewardUser(props) {
  let { user, reward, post, community, type } = props;

  // do we need checks against reward fund? don't think so since it comes from smart contract
  // treasury.rewardFund -= reward;
  // if (treasury.rewardFund < 0) throw new Error('Reward fund is empty!');
  // treasury = await treasury.save();
  // user.balance += reward;
  // user = await user.save();

  console.log('Awarded ', user.name, ' ', reward, ' tokens for ', post);

  let s = reward === 1 ? '' : 's';
  let action = type === 'vote' ? 'upvoting ' : '';

  let amount = numbers.abbreviateNumber(reward);
  // let amount = reward;
  let text = `You earned ${amount} coin${s} from ${action}this post`;
  let alertText = `You earned ${amount} coin${s} from ${action}a post`;
  console.log(text);

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
  // let treasury = await Treasury.findOne({ community });
  let payouts = {};
  // let ethAccounts = [];
  // let ethBalances = [];
  let notifications = [];
  let distributedRewards = 0;

  let updatedUsers = posts.map(async post => {
    let votes = await Invest.find({ post: post.post });
    // compute total vote shares

    let totalShares = 0;
    votes.forEach(vote => {
      totalShares += vote.shares;
    });

    if (totalShares === 0) {
      return;
    }

    console.log('totalShares ', totalShares);
    console.log('post shares ', post.shares);
    let curationReward = post.payout;

    // let author = await User.findOne({ _id: post.user }, 'name balance deviceTokens badge ethAddress');

    // // Current code considers author as the first voter
    // // alternately we can use a fixed percentage of reward
    // // need to edit the way shares is computed in invest.model createVote()

    // // let authorShare = Math.max(AUTHOR_SHARE, author.shares / totalShares);
    // // is it better to use post share or post payout?
    // // let curationReward = post.payout * (1 - authorShare);

    // let authorShare = 0;
    // if (totalShares > 0) authorShare = 1 / totalShares;

    // let authorPayout = Math.floor(authorShare * post.payout);

    // distributedRewards += authorPayout;

    // payouts[author._id] = payouts[author._id] ? payouts[author._id] + authorPayout : authorPayout;

    // // TODO diff decimal
    // console.log('author payout ', authorPayout / (10 ** 18));
    // author.balance += authorPayout / (10 ** 18);
    // await author.save();

    // if (authorPayout > 0) {
    //   // await rewardUser({ user: author, reward: authorPayout, treasury, post, community });
    //   notifications.push({
    //     user: author,
    //     reward: authorPayout / (10 ** 18),
    //     // treasury,
    //     post: post.post,
    //     community,
    //   });
    //   ethAccounts.push(author.ethAddress[0]);
    //   ethBalances.push(authorPayout);
    // }


    //  ---------- Curation rewards ------------

    console.log('curationReward', curationReward);

    let updatedVotes = votes.map(async vote => {
      // don't count downvotes
      if (vote.amount < 0) return;

      let user = await User.findOne({ _id: vote.investor }, 'name balance deviceTokens badge');

      let curationWeight = vote.shares / totalShares;
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
        // treasury,
        post: post.post,
        type: 'vote',
        community,
      });

      // ethAccounts.push(user.ethAddress[0]);
      // ethBalances.push(curationPayout);
    });
    return Promise.all(updatedVotes);
  });

  await Promise.all(updatedUsers);

  // transfer amounts to distributed rewards
  console.log('distribute rewards ', distributedRewards);
  console.log('distribute rewards should be', distributedRewards);


  // we'll do this individually upon request to save on gas
  let sendNotes = notifications.map(async n => rewardUser(n));
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
  let totalBalance = balances.reduce((a, c) => c.balance + a, 0);
  let communityBalance = balances.find(c => c._id === community.slug).balance;

  // compute portion of reward pool allocated to community
  let communityRewardPool = _rewardPool * communityBalance / totalBalance;

  console.log('Rewards for ', community.slug, ' ', communityRewardPool);

  let updatedPosts = await distributeRewards(community, communityRewardPool);
  let payouts = await distributeUserRewards(updatedPosts, community.slug);

  let displayPosts = updatedPosts.map(p => ({
    title: p.post,
    payout: p.payout,
    payoutShare: p.payoutShare,
    relevance: p.relevance,
  }));

  console.log('\x1b[32m', 'allocated rewards to ', community.slug, ' ', communityRewardPool);
  console.log('\x1b[32m', 'distributed rewards to posts ', displayPosts);
  console.log('\x1b[32m', payouts);
  console.log('\x1b[0m');
  return payouts;
}

let computingRewards = false;
exports.rewards = async () => {
  // safeguard
  if (computingRewards) {
    console.log('Computing eth rewards in progress');
    return null;
  }
  computingRewards = true;
  try {
    totalDistributedRewards = 0;
    let communities = await Community.find({});
    let rewardPool = await allocateRewards();
    let balances = await Community.getBalances();
    communities = await communities.map(c => computeCommunityRewards(c, rewardPool, balances));
    communities = await Promise.all(communities);
    computingRewards = false;

    if (totalDistributedRewards > 0) {
      await Eth.allocateRewards(totalDistributedRewards);
    }

    rewardPool = await Eth.getParam('rewardPool', { noConvert: true });
    let distPool = await Eth.getParam('distributedRewards', { noConvert: true });

    // console.log('distributedRewards Pool', distPool);
    console.log('Finished distributing rewards, remaining reward fund: ', rewardPool);

    return communities;
  } catch (error) {
    console.log('rewards error', error);
    return null;
  }
};

