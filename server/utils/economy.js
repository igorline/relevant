import Treasury from '../api/treasury/treasury.model';
import User from '../api/user/user.model';
import Post from '../api/post/post.model';
import Invest from '../api/invest/invest.model';
import apnData from '../pushNotifications';
import Notification from '../api/notification/notification.model';

const PAYOUT_FREQUENCY = 1 / (365 * 24); // once an hour
const YEARLY_INFLATION = 0.1; // 10%
const INTERVAL_INFLAITION = Math.pow(1 + YEARLY_INFLATION, PAYOUT_FREQUENCY) - 1;
const INIT_COIN = 10000000;
const SHARE_DECAY = 6 * 24 * 60 * 60 * 1000; // 6 days in ms
const AUTHOR_SHARE = 1 / 2;

async function createCoins() {
  let treasury = await Treasury.findOne({});
  let outstanding = 0;
  let users = await User.find({});
  users.forEach(u => outstanding += u.balance);
  treasury.balance = INIT_COIN - outstanding;
  treasury.totalTokens = INIT_COIN;
  treasury.currentShares = 0;
  treasury.rewardFund = 0;
  treasury.lastRewardFundUpdate = new Date(0);
  treasury = await treasury.save();
  console.log(treasury);
  return treasury;
}

// function init() {
//   createCoins()
//   .catch(err => console.log(err));
// }
// init();



async function computePostPayout(posts, treasury) {
  // let posts = await Post.find({ paidOut: false, payoutTime: { $lt: now } });
  let updatedPosts = posts.map(async post => {
    // linear reward curve
    post.payoutShare = post.relevance / treasury.currentShares;
    post.payout = treasury.rewardFund * post.payoutShare;
    post = await post.save();
    return post;
  });
  updatedPosts = await Promise.all(updatedPosts);
  return updatedPosts;
}


exports.allocateRewards = async () => {
  let treasury = await Treasury.findOne({});
  let newTokens = INTERVAL_INFLAITION * treasury.totalTokens;
  treasury.totalTokens += newTokens;
  treasury.rewardFund += newTokens;
  return await treasury.save();
};


exports.distributeRewards = async () => {
  let treasury = await Treasury.findOne({});
  let now = new Date();
  let posts = await Post.find({ paidOut: false, payoutTime: { $lte: now } });
  let estimatePosts = await Post.find({ paidOut: false, payoutTime: { $gt: now } });

  // decay curren reward shares
  let decay = (now.getTime() - treasury.lastRewardFundUpdate.getTime()) / SHARE_DECAY;
  console.log('decay ', decay);
  treasury.currentShares *= 1 / decay;

  // add post relevance to treasury
  posts.forEach(post => {
    treasury.currentShares += post.relevance;
    post.paidOut = true;
  });

  treasury = await treasury.save();

  let updatedPosts = await computePostPayout(posts, treasury);
  estimatePosts = await computePostPayout(estimatePosts, treasury);
  console.log(updatedPosts);
  console.log(estimatePosts);

  return updatedPosts;
};

async function rewardUser(props) {
  let { user, reward, post, treasury, type } = props;

  treasury.rewardFund -= reward;
  if (treasury.rewardFund < 0) throw new Error('Reward fund is empty!');
  treasury = await treasury.save();
  user.balance += reward;
  user = await user.save();

  console.log('Awarded ', user.name, ' ', reward, ' tokens');

  let s = reward === 1 ? '' : 's';
  let action = type === 'vote' ? 'upvoting ' : '';
  let text = `You earned ${reward} coin${s} from ${action}this post`;
  let alertText = `You earned ${reward} coin${s} from ${action}a post`;

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

exports.distributeUserRewards = async (posts) => {
  let treasury = await Treasury.findOne({});
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
      rewardUser({ user: author, reward: authorPayout, treasury, post });
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

      rewardUser({ user, reward: curationPayout, treasury, post, type: 'vote' });
    });
    updatedVotes = await Promise.all(updatedVotes);
    return updatedVotes;
  });

  await Promise.all(updatedUsers);
  console.log('Finished distributing rewards, remaining reward fund: ', treasury.rewardFund);

  return payouts;
};

// exports.pendingUserReward(userId) {
//   let now = new Date();
//   let votes = await Invest.find({ payoutDate: { $lt: now } });
  

// }