import Earnings from 'server/api/earnings/earnings.model';
import { sendNotification as sendPushNotification } from 'server/notifications';
import { computeApproxPageRank } from 'server/utils/pagerankCompute';
import { computePostPayout } from 'app/utils/rewards';
import Community from 'server/api/community/community.model';
import { userVotePower } from 'server/config/globalConstants';
import Post from 'server/api/post/post.model';
import User from 'server/api/user/user.model';
import Subscription from 'server/api/subscription/subscription.model';
import Notification from 'server/api/notification/notification.model';
import Invest from 'server/api/invest/invest.model';
import Relevance from 'server/api/relevance/relevance.model';

const { NODE_ENV } = process.env;

exports.postInvestments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const { community } = req.query;

    const investments = await Invest.find({ post: postId, amount: { $gt: 0 } })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate({
      path: 'investor',
      select: 'relevance name image handle',
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

    const blocked = user ? [...user.blocked, ...user.blockedBy] : [];

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
    return res.status(200).json(investments);
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

async function updateSubscriptions({ post, user, amount, undoInvest }) {
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
  subscription.amount = Math.min(subscription.amount + inc, 20);
  return subscription.save();
}

async function updateAuthor(params) {
  const { post, user, amount, authorPagerank, undoInvest } = params;
  let { author } = params;

  if (!author) {
    if (amount < 0) return null;
    const children = await Post.find({
      parentPost: post._id,
      parentComment: { $exists: false }
    }).populate('user');

    const authors = children.map(child => child.user);
    authors.map(u =>
      sendAuthorNotification({ author: u, user, post, undoInvest, type: 'upvoteParent' })
    );
    return null;
  }

  const pageRankChange = author.relevance
    ? author.relevance.pagerank - authorPagerank
    : 0;
  const type = 'upvote';

  author = await author.save();
  author.updateClient(user);

  if (amount < 0) return null;

  await sendAuthorNotification({
    author,
    user,
    post,
    undoInvest,
    amount: pageRankChange,
    type
  });
  return author;
}

async function sendAuthorNotification({ author, user, post, type, undoInvest, amount }) {
  if (!author) return null;
  // Remove notification if undo;
  if (undoInvest) {
    await Notification.deleteOne({
      type,
      post: post._id,
      forUser: author._id,
      byUser: user._id
    }).exec();
    return null;
  }

  Notification.createNotification({
    post: post._id,
    forUser: author._id,
    byUser: user._id,
    amount,
    type
  });

  const action =
    type === 'upvote' ? ' thinks your comment is relevant' : ' upvoted a link you shared';

  const payload = {
    fromUser: user,
    toUser: author,
    post,
    action,
    noteType: type
  };
  const alert = user.name + action;

  try {
    sendPushNotification(author, alert, payload);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
  return null;
}

// General problem: a user with some reputation who hasn't upvoted anyone
// adds much more weight to the first few posts he/she upvotes
// TODO: Solution — only start counting weights after N upvotes?

// Rate-limit vote weights?

// Weight allocation attack:
// Above also solves this possible attack...
// 1. Build up some degree of relevance (takes time)
// 2. Create N sibyls ahead of time and upvote each one
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
    post = await Post.findOne({ _id: post._id })
    .populate({ path: 'parentPost' })
    .populate({ path: 'data', match: { community } });
    // .populate('investments').exec();
    // postCommunity = post.community || 'relevant';

    // unhide twitter commentary
    if (amount > 0 && post.hidden && post.parentPost) {
      await post.parentPost.insertIntoFeed(communityId, community);
      post.hidden = false;
    }
    post.hidden = false;

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

    // THIS IS JUST EXTRA SECURITY, REMOVE LATER
    if (author && !author.relevance.community) {
      author.relevance.community = community;
    }

    // ------ get existing investment ------
    let investment = await investCheck({ user, post, amount, communityId });

    // ------ add or remove post from feed ------
    // await updateUserFeed(user, post, irrelevant);

    // Deprecated - keep around for comparison analysis?
    const userRelevance = user.relevance ? user.relevance.pagerank : 0;

    let relevanceToAdd = userVotePower(userRelevance);
    if (amount < 0) relevanceToAdd *= -1;

    let undoInvest;
    if (investment) {
      undoInvest = true;
      relevanceToAdd = -investment.relevantPoints;
    }

    post.data.relevance += relevanceToAdd;
    if (relevanceToAdd !== 0) {
      const vote = undoInvest ? -1 : 1;
      if (amount < 0) post.data.downVotes += vote;
      else post.data.upVotes += vote;
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
    if (investment && !undoInvest) {
      investment.rankChange = post.data.pagerank - initialPostRank;
      await investment.save();
    }

    await post.updateRank({ communityId });

    const communityInstance = await Community.findOne({ _id: communityId });
    post.data.expectedPayout = computePostPayout(post.data, communityInstance);

    post = await post.save();
    if (post.parentPost) {
      await post.parentPost.updateRank({ communityId });
      await post.parentPost.save();
    }

    res.status(200).json({
      investment,
      success: true,
      subscription,
      undoInvest,
      rankChange: post.data.pagerank - initialPostRank
    });
    post.updateClient();

    Earnings.updateEarnings({ post, communityId });

    // updates user investments
    user.investmentCount = await Invest.countDocuments({
      investor: user._id,
      amount: { $gt: 0 }
    });

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
