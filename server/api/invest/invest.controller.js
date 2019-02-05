import { EventEmitter } from 'events';
import Earnings from 'server/api/earnings/earnings.model';
import apnData from 'server/pushNotifications';
import { computeApproxPageRank } from 'server/utils/pagerankCompute';
import { computePayout } from 'app/utils/post';
import Community from 'server/api/community/community.model';

const Post = require('../post/post.model');
const User = require('../user/user.model');
const Subscription = require('../subscription/subscription.model');
const Notification = require('../notification/notification.model');
const Invest = require('./invest.model');
const Relevance = require('../relevance/relevance.model');

const InvestEvents = new EventEmitter();


const { NODE_ENV } = process.env;

exports.postInvestments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const { community } = req.query;

    const investments = await Invest.find({ post: postId, ownPost: false })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate({
      path: 'investor',
      select: 'relevance name image',
      populate: {
        path: 'relevance',
        match: { global: true, community }
      }
    });

    return res.status(200).json(investments);
  } catch (err) {
    return next(err);
  }
};

exports.downvotes = async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || null;
  const skip = parseInt(req.query.skip, 10) || null;
  let downvotes;
  try {
    downvotes = await Invest.find({ amount: { $lt: 0 } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('post');

    return res.status(200).json(downvotes);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { communityId } = req.communityMember;
    const { user } = req;

    let id;

    let blocked = [];
    if (user) {
      blocked = [...user.blocked, ...user.blockedBy];
      id = user._id;
    }

    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const userId = req.params.userId || null;
    const sortQuery = { createdAt: -1 };
    const query = { investor: userId, amount: { $gt: 0 } };

    if (blocked.find(u => u.toString() === userId.toString())) {
      return res.status(200).json({});
    }

    const investments = await Invest.find(query)
    .populate({
      path: 'post',
      populate: [
        {
          path: 'embeddedUser.relevance',
          match: { communityId, global: true }
        },
        {
          path: 'data',
          select: 'pagerank'
        },
        {
          path: 'metaPost'
        }
      ]
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);
    res.status(200).json(investments);

    let postIds = investments.map(inv => (inv.post ? inv.post._id : null));
    postIds = postIds.filter(postId => postId);
    return Post.sendOutInvestInfo(postIds, id);
  } catch (err) {
    return next(err);
  }
};

async function updateInvestment(params) {
  let { investment } = params;
  const { post, user, amount, relevanceToAdd, community, communityId } = params;
  investment = await Invest.createVote({
    post,
    user,
    amount,
    relevanceToAdd,
    investment,
    communityId,
    community
  });
  return investment;
}

async function investCheck(params) {
  const { user, post, amount, communityId } = params;
  let type = 'upvote';
  if (amount < 0) {
    type = 'downvote';
    // Do we still want this limit for older posts?
    // don't let users downvote posts older than one week
    const now = new Date();
    if (
      post.data.postDate < now.getTime() - 1000 * 60 * 60 * 24 * 7 &&
      NODE_ENV === 'production'
    ) {
      throw new Error('you cannot downvote posts older than one week');
    }
  }
  if (user._id.equals(post.user)) {
    throw new Error('You can not ' + type + ' your own comment');
  }

  const investment = await Invest.findOne({
    investor: user._id,
    post: post._id,
    communityId
  });

  // TODO undo invest
  if (investment) {
    const now = new Date();
    const timeElapsed = now.getTime() - new Date(investment.createdAt).getTime();

    // TODO 15m to update post is this fine?
    if (timeElapsed > 15 * 60 * 1000 && NODE_ENV === 'production') {
      throw new Error('You cannot change your vote after 15m');
    }
    if (
      new Date(post.data.payoutTime).getTime() < now.getTime() &&
      NODE_ENV === 'production'
    ) {
      throw new Error('you cannot change your vote after post payout');
    }
  }
  return investment;
}

async function updateSubscriptions(params) {
  const { post, user, amount, undoInvest } = params;
  if (amount < 0) return null;
  let subscription = await Subscription.findOne({
    follower: user._id,
    following: post.user
  });
  if (!subscription) {
    if (undoInvest) return null;
    subscription = new Subscription({
      follower: user._id,
      following: post.user,
      amount: 0
    });
  }
  const inc = undoInvest ? Math.max(-4, -subscription.amount) : 4;
  subscription.amount = Math.max(subscription.amount + inc, 20);
  return subscription.save();
}

async function updateAuthor(params) {
  const {
    post,
    user,
    amount,
    authorPagerank,
    undoInvest,
  } = params;
  let { author } = params;

  if (!author) return null;

  const pageRankChange = author.relevance.pagerank - authorPagerank;

  let type = 'upvote';
  if (amount < 0) type = 'downvote';

  author = await author.save();
  author.updateClient(user);

  // Remove notification if undo;
  if (undoInvest) {
    await Notification.remove({
      type,
      post: post._id,
      forUser: author._id,
      byUser: user._id
    }).exec();
    return author;
  }

  if (amount > 0) {
    Notification.createNotification({
      post: post._id,
      forUser: author._id,
      byUser: user._id,
      amount: pageRankChange,
      type
    });

    let alert = user.name + ' thinks your comment is relevant';
    const payload = { 'Relevance from': user.name };
    try {
      // TEST - don't send notification after upvote
      apnData.sendNotification(author, alert, payload);
      const now = new Date();
      if (post.createdAt > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        alert = null;
      }
      apnData.sendNotification(author, alert, payload);
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  }
  return author;
}

// General problem: a user with some reputation who hasn't upvoted anyone
// adds much more weight to the first few posts he/she upvotes
// TODO: Solution — only start counting weights after N upvotes?

// Problem: Vote Power rate-limiting can be avoided by creating a chain of Sybil nodes
// Should we not rate-limit reputation voting?

// Above also solves this possible attack...
// 1. Build up some degree of relevance (takes time)
// 2. Create N sibyls ahead of time and upvote each while on max vote power
// (takes time but can be automated)
// 3. Wait until right before the a given post's payout time
// 4. Each sybil upvotes the post and effectively transferring all of the rep weight to the post
// 5. After, delete the sybils, and to restore original weights
// This is mitigated by not deleting links to sybil nodes upon their deletion :)
// Partial solution: prevent undoing vote after payout
exports.create = async (req, res, next) => {
  try {
    const { community, communityId } = req.communityMember;

    let user = req.user._id;
    let { post, amount } = req.body;

    // amount should be on a scale of -1 to 1 to prevent abuse;
    amount = Math.max(-1, amount);
    amount = Math.min(1, amount);

    // ------ post ------
    post = await Post.findOne({ _id: post._id }, '-comments')
    .populate({ path: 'parentPost' })
    .populate({ path: 'data', match: { community } });
    // .populate('investments').exec();
    // postCommunity = post.community || 'relevant';

    // unhide twitter commentary
    if (amount > 0 && post.hidden) {
      await post.parentPost.insertIntoFeed(communityId);
      post.hidden = false;
    }

    // ------ investor ------
    user = await User.findOne(
      { _id: user },
      'name balance ethAddress image lastVote votePower handle tokenBalance lockedTokens'
    ).populate({
      path: 'relevance',
      match: { communityId, global: true }
    });

    const now = new Date();
    const elapsedTime = new Date(now).getTime() - new Date(user.lastVote || 0).getTime();
    if (elapsedTime < 5 * 1000 && NODE_ENV === 'production') {
      throw new Error('you cannot up-vote posts more often than 5s');
    }

    let author = await User.findOne(
      { _id: post.user },
      'name handle image balance deviceTokens badge'
    ).populate({
      path: 'relevance',
      match: { communityId, global: true }
    });

    // TODO create twitter user authors!

    // Init user relevance
    // TODO: should this be done upon joining a community?
    if (author && !author.relevance) {
      author.relevance = new Relevance({
        user: author._id,
        communityId,
        community,
        global: true
      });
      author.relevance = await author.relevance.save();
    }

    // ------ get existing investment ------
    let investment = await investCheck({ user, post, amount, communityId });

    // ------ add or remove post from feed ------
    // await updateUserFeed(user, post, irrelevant);

    // Deprecated - keep around for comparison analysis?
    const userRelevance = user.relevance ? user.relevance.pagerank : 0;

    let relevanceToAdd;
    if (userRelevance < 0) relevanceToAdd = 0;
    else {
      // use sqrt function for post relevance
      relevanceToAdd = Math.round(Math.sqrt(userRelevance * 4));
      relevanceToAdd = Math.max(1, relevanceToAdd);
    }
    if (amount < 0) relevanceToAdd *= -1;

    let undoInvest;
    if (investment) {
      undoInvest = true;
      relevanceToAdd = -investment.relevantPoints;
    }
    post.data.relevance += relevanceToAdd;
    if (relevanceToAdd !== 0) {
      if (amount < 0) post.data.downVotes++;
      else post.data.upVotes++;
    }

    // ------ update investment records ------
    investment = await updateInvestment({
      post,
      user,
      amount,
      relevanceToAdd,
      investment,
      community,
      communityId
    });

    post.data = await post.data.save();

    let authorPagerank;
    if (author) {
      authorPagerank = author.relevance.pagerank || 0;
    }

    // update subscriptions
    const subscription = await updateSubscriptions({ post, user, amount });

    res.status(200).json({
      success: true,
      subscription,
      undoInvest
    });
    post.updateClient();

    // TODO - put the rest into queue on worker;
    const initialPostRank = post.data.pagerank;
    // TODO make sure this doesn't take too long
    // ({ author, post } = await computePageRank({
    //   communityId, community, author, post, investment, fast: amount >= 0 || false
    // }));
    const updatePageRank = await computeApproxPageRank({
      communityId,
      author,
      post,
      investment,
      user,
      undoInvest
    });

    if (updatePageRank) {
      ({ author, post } = updatePageRank);
    }
    if (investment) {
      investment.rankChange = initialPostRank - post.data.pagerank;
      await investment.save();
    }

    await post.updateRank({ communityId });

    const communityInstance = await Community.findOne({ _id: communityId });
    post.data.expectedPayout = computePayout(post.data, communityInstance);
    console.log('expectedPayout', post.data.expectedPayout);

    post = await post.save();
    if (post.parentPost) {
      await post.parentPost.updateRank({ communityId });
      await post.parentPost.save();
    }
    post.updateClient();
    Earnings.updateEarnings({ post, communityId });

    // updates user investments
    user.investmentCount = await Invest.count({ investor: user._id, amount: { $gt: 0 } });

    // update subscriptions
    user = await user.getSubscriptions();
    user = await user.save();

    user.updateClient();

    // updates author relevance
    author = await updateAuthor({
      author,
      community,
      post,
      user,
      amount,
      userRelevance,
      authorPagerank,
      undoInvest,
      communityId
    });
  } catch (err) {
    next(err);
  }
};


exports.InvestEvents = InvestEvents;
