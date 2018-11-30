import { EventEmitter } from 'events';
import apnData from '../../pushNotifications';
import { VOTE_COST_RATIO, POWER_REGEN_INTERVAL } from '../../config/globalConstants';
import * as ethUtils from '../../utils/ethereum';
import { computeApproxPageRank } from '../../utils/pagerankCompute';

let Post = require('../post/post.model');
let User = require('../user/user.model');
let Subscription = require('../subscription/subscription.model');
let Notification = require('../notification/notification.model');
let Invest = require('./invest.model');
let Relevance = require('../relevance/relevance.model');
// let Feed = require('../feed/feed.model');
let Treasury = require('../treasury/treasury.model');
let CommunityFeed = require('../communityFeed/communityFeed.model');

let InvestEvents = new EventEmitter();

// async function removeDownvotes() {
//   try {
//     let notes = await Notification.find({ type: 'downvote' }).remove();
//   } catch (err) {
//     console.log(err);
//   }
// }
// removeDownvotes();


const COIN = true;

// function convertInvest() {
//   Invest.find({})
//   .then(invs => {
//     invs.forEach(inv => {
//       // inv.author = inv.poster;
//       if (inv.author == inv.investor) {
//         console.log(inv);
//         inv.ownPost = true;
//       } else inv.ownPost = false;
//       inv.save();
//     });
//   });
// }
// convertInvest();

// RESET ALL USERS
// function resetUsers() {
//   User.update({}, { balance: 7 }, { multi: true }).exec();
// }
// resetUsers();

// User.update({ relevance: { $lt: 10 } }, { relevance: 10 }, { multi: true }).exec();

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

// function updateUserFeed(user, post, irrelevant) {
//   if (!irrelevant) {
//     return Feed.findOneAndUpdate(
//       {
//         userId: user._id,
//         post: post._id,
//         metaPost: post.metaPost
//       },
//       { tags: post.tags, createdAt: new Date() },
//       { upsert: true },
//     ).exec();
//   }
//   return Feed.find({
//     userId: user._id,
//     post: post._id,
//   }).remove();
// }

exports.postInvestments = async (req, res) => {
  try {
    let postId = req.params.postId;
    let limit = parseInt(req.query.limit, 10);
    let skip = parseInt(req.query.skip, 10);
    let community = req.query.community;

    console.log('community ', community);

    let investments = await Invest.find({ post: postId, ownPost: false })
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

    // investments = investments.map(inv => {
    //   inv = inv.toObject();
    //   if (inv.amount < 1) inv.investor = { name: 'Someone' };
    //   return inv;
    // });
    // investments = investments.filter(inv => inv.investor ? inv.author != inv.investor._id : true);

    return res.status(200).json(investments);
  } catch (err) {
    handleError(res, err);
  }
};

exports.downvotes = async (req, res) => {
  let limit = parseInt(req.query.limit, 10) || null;
  let skip = parseInt(req.query.skip, 10) || null;
  let downvotes;
  try {
    downvotes = await Invest.find({ amount: { $lt: 0 } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('post');
  } catch (err) {
    return handleError(res, err);
  }
  return res.status(200).json(downvotes);
};

exports.show = async (req, res, next) => {
  try {
    let { communityId } = req.communityMember;

    let id;

    let blocked = [];
    if (req.user) {
      let user = req.user;
      blocked = [...user.blocked, ...user.blockedBy];
      id = req.user._id;
    }

    let limit = parseInt(req.query.limit, 10);
    let skip = parseInt(req.query.skip, 10);
    let userId = req.params.userId || null;
    let sortQuery = { createdAt: -1 };
    let query = { investor: userId, amount: { $gt: 0 } };
    let investments;

    if (blocked.find(u => u === userId)) {
      return res.status(200).json({});
    }

    investments = await Invest.find(query)
    .populate({
      path: 'post',
      populate: [{
        path: 'embeddedUser.relevance',
        match: { communityId, global: true }
      },
      {
        path: 'data',
        select: 'pagerank'
      },
      {
        path: 'metaPost',
      }]
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);
    res.status(200).json(investments);


    let postIds = investments.map(inv => inv.post ? inv.post._id : null);
    postIds = postIds.filter(postId => postId);
    Post.sendOutInvestInfo(postIds, id);
  } catch (err) {
    next(err);
  }
};

exports.destroy = (req, res) => {
  let query = {
    investor: req.body.investor,
    post: req.body.post
  };
  let investmentId = null;

  Invest.find(query).then((invests) => invests)
  .then((invests) => {
    if (invests.length) {
      invests.forEach((investment) => {
        User.findOne({ _id: investment.investor })
        .then((investor) => {
          investor.balance += investment.amount;
          investor.save();
        });
        investmentId = investment._id;
        return investment.remove();
      });
    }
  }).then(() => Post.findOne({ _id: req.body.post }))
  .then((foundPost) => {
    foundPost.investments.forEach((investment, i) => {
      if (JSON.stringify(investment) === JSON.stringify(investmentId)) {
        console.log('removing investment from post array');
        foundPost.investments.splice(i, 1);
      }
    });
    return foundPost.save();
  })
  .then((savedPost) =>
    Post.findOne({ _id: savedPost._id })
    .populate('user tags investments mentions')
    .exec((err, populatedPost) => populatedPost)
  )
  .then((populatedPost) => {
    populatedPost.updateClient();
    res.json(200, true);
  })
  .catch(err => handleError(res, err));
};

async function updateInvestment(params) {
  let { post, user, amount, relevanceToAdd, investment, community, communityId } = params;
  // console.log('adding ', relevanceToAdd, ' to post ', post._id);
  investment = await Invest.createVote({
    post, user, amount, relevanceToAdd, investment, communityId, community
  });

  // DEPRECATED - make sure we don't need this
  post.data.relevance += relevanceToAdd;
  if (relevanceToAdd !== 0) {
    if (amount < 0) post.data.downVotes++;
    else post.data.upVotes++;
  }
  return investment;
}

async function investCheck(params) {
  let { user, post, amount, communityId } = params;
  let type = 'upvote';
  if (amount < 0) {
    type = 'downvote';
    // Do we still want this limit for older posts?
    // don't let users downvote posts older than one week
    let now = new Date();
    if (post.data.postDate < now.getTime() - 1000 * 60 * 60 * 24 * 7 && process.env.NODE_ENV === 'production') {
      throw new Error('you cannot downvote posts older than one week');
    }
  }
  if (user._id === post.user) {
    throw new Error('You can not ' + type + 'your own post');
  }

  let investment = await Invest.findOne({ investor: user._id, post: post._id, communityId });

  // TODO undo invest
  if (investment) {
    let now = new Date();
    let timeElapsed = now.getTime() - (new Date(investment.createdAt)).getTime();

    // TODO 15m to update post is this fine?
    if (timeElapsed > 15 * 60 * 1000 && process.env.NODE_ENV === 'production') {
      throw new Error('You cannot change your vote after 15m');
    }
    if ((new Date(post.data.payoutTime)).getTime() < now.getTime() && process.env.NODE_ENV === 'production') {
      throw new Error('you cannot change your vote after post payout');
    }
  }
  return investment;
}

async function updateSubscriptions(params) {
  let { post, user, amount, undoInvest } = params;
  if (amount < 0) return null;
  let subscription = await Subscription.findOne({
    follower: user._id,
    following: post.user,
  });
  if (!subscription) {
    if (undoInvest) return null;
    subscription = new Subscription({
      follower: user._id,
      following: post.user,
      amount: 0,
    });
  }
  let inc = undoInvest ? Math.max(-4, -subscription.amount) : 4;
  subscription.amount = Math.max(subscription.amount + inc, 20);
  return subscription.save();
}

async function updateAuthor(params) {
  let {
    author,
    community,
    post,
    user,
    amount,
    userRelevance,
    authorPagerank,
    undoInvest,
    communityId
  } = params;

  if (!author) return null;

  // --------- start DEPRECATED ------------
  let authorRelevance = author.relevance ? author.relevance.relevance : 0;
  let diff = userRelevance - authorRelevance;
  let adjust = 1;
  if (diff > 0) adjust = (diff ** (1 / 4)) + 1;
  if (amount < 0) adjust *= -1;
  if (userRelevance < 0) {
    adjust = 0;
  }
  authorRelevance += adjust;
  if (adjust !== 0) {
    authorRelevance = await Relevance.updateUserRelevance(post.user, post, adjust, communityId);
    await authorRelevance.updateRelevanceRecord();
    authorRelevance = authorRelevance.relevance;
  }
  // --------- end DEPRECATED ------------

  let pageRankChange = author.relevance.pagerank - authorPagerank;
  console.log('adding ', pageRankChange, ' relevance to ', author.name);


  let type = 'upvote';
  if (amount < 0) type = 'downvote';

  // update user's earnings status
  // await Invest.updateUserInvestment(user, author, post, adjust, amount);
  author.relevance.relevance = authorRelevance;
  author = await author.save();
  author.updateClient(user);

  // Remove notification if undo;
  if (undoInvest) {
    console.log('removing notification ', type);
    await Notification.remove({
      type, post: post._id, forUser: author._id, byUser: user._id
    }).exec();
    return author;
  }

  if (amount > 0) {
    Notification.createNotification({
      post: post._id,
      forUser: author._id,
      byUser: user._id,
      amount: pageRankChange,
      type,
    });

    let alert = user.name + ' thinks your post is relevant';
    let payload = { 'Relevance from': user.name };
    try {
      // TEST - don't send notification after upvote
      apnData.sendNotification(author, alert, payload);
      let now = new Date();
      if (post.createdAt > now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        alert = null;
      }
      apnData.sendNotification(author, alert, payload);
    } catch (err) {
      console.log(err);
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
// 2. Create N sibyls ahead of time and upvote each while on max vote power (takes time but can be automated)
// 3. Wait until right before the a given post's payout time
// 4. Each sybil upvotes the post and effectively transferring all of the rep weight to the post
// 5. After, delete the sybils, and to restore original weights
// This is mitigated by not deleting links to sybil nodes upon their deletion :)
// Partial solution: prevent undoing vote after payout
exports.create = async (req, res, next) => {
  try {
    let { community, communityId } = req.communityMember;

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
      await post.parentPost.insertIntoFeed(community);
      post.hidden = false;
    }

    // ------ investor ------
    user = await User.findOne(
      { _id: user },
      'name balance ethAddress image lastVote votePower handle tokenBalance'
    ).populate({
      path: 'relevance',
      match: { communityId, global: true }
    });

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
        user: author._id, communityId, global: true
      });
      author.relevance = await author.relevance.save();
    }

    // ------ get existing investment ------
    let investment = await investCheck({ user, post, amount, communityId });

    // ------ add or remove post from feed ------
    // await updateUserFeed(user, post, irrelevant);

    // Deprecated - keep around for comparison analysis?
    let userRelevance = user.relevance ? user.relevance.relevance : 0;
    let relevanceToAdd;
    if (userRelevance < 0) relevanceToAdd = 0;
    else {
      // use sqrt function for post relevance
      relevanceToAdd = Math.round(Math.sqrt(userRelevance));
      relevanceToAdd = Math.max(1, relevanceToAdd);
    }
    if (amount < 0) relevanceToAdd *= -1;

    let undoInvest;
    if (investment) {
      undoInvest = true;
      relevanceToAdd = -investment.relevantPoints;
    }
    // if (investment) relevanceToAdd = 0;
    // if (investment && Math.abs(investment.amount) < 0) {
    //   relevanceToAdd = -investment.relevantPoints;
    // }

    // ------ update investment records ------
    investment = await updateInvestment({ post, user, amount, relevanceToAdd, investment, community, communityId });

    post.data = await post.data.save();
    // console.log('updated post data: ', post.data);

    let authorPagerank;
    if (author) {
      authorPagerank = author.relevance.pagerank || 0;
    }

    // update subscriptions
    let subscription = await updateSubscriptions({ post, user, amount });

    console.log('sending invest response');
    res.status(200).json({
      success: true,
      subscription,
      undoInvest
    });

    let initialPostRank = post.data.pagerank;
    // TODO make sure this doesn't take too long
    // ({ author, post } = await computePageRank({
    //   communityId, community, author, post, investment, fast: amount >= 0 || false
    // }));
    let updatePageRank = await computeApproxPageRank({
      communityId, author, post, investment, user, undoInvest
    });

    if (updatePageRank) {
      ({ author, post } = updatePageRank);
    }
    if (investment) {
      investment.rankChange = initialPostRank - post.data.pagerank;
      console.log('rankChange ', initialPostRank - post.data.pagerank);
      await investment.save();
    }

    await post.updateRank(community);
    post = await post.save();
    if (post.parentPost) {
      // TODO - work on nesting here
      // TODO source community?
      await post.parentPost.updateRank(community);
      await post.parentPost.save();
    }

    // updates user investments
    user.investmentCount = await Invest.count({ investor: user._id, amount: { $gt: 0 } });

    // update subscriptions
    user = await user.getSubscriptions();
    user = await user.save();
    console.log('new page rank ', post.data.pagerank);

    user.updateClient();
    post.updateClient();

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

    // updates previous user's relevance
    // handleOtherInvestments();
  } catch (err) {
    next(err);
  }
};

// NOT USED ANYMORE
// async function handleOtherInvestments() {
//   let existingInvestments = await Invest.find({
//     post: post._id,
//     investor: { $nin: [user._id, post.user] }
//   });

//   existingInvestments.forEach(async investment => {
//     try {
//       let existingInvestor = await User.findOne({ _id: investment.investor }, 'relevance name image');
//       let ratio = 1 / existingInvestments.length;

//       let relevanceEarning = 0;
//       let earnings;

//       // need this to determine relevance increase;
//       // TODO also do voter community
//       let existingInvestorRelevance = await Relevance.findOne({
//         community,
//         user: investment.investor,
//         global: true
//       }, 'relevance');
//       existingInvestorRelevance = existingInvestorRelevance ?
//         existingInvestorRelevance.relevance :
//         0;

//       if (relevanceToAdd !== 0) {
//         let diff = userRelevance - existingInvestorRelevance;

//         relevanceEarning = 1;
//         if (diff > 0) relevanceEarning = Math.pow(diff, 1 / 4) + 1;
//         console.log('adding relevance of ', relevanceEarning, ' to ', existingInvestor._id);

//         // TODO: test this
//         if (userRelevance < 0) relevanceEarning = 0;

//         let previousSign = investment.amount / Math.abs(investment.amount);
//         let thisSign = amount / Math.abs(amount);
//         relevanceEarning *= thisSign * previousSign;

//         relevanceEarning *= ratio;

//         if (relevanceEarning < 0.05) return null;
//         earnings = await Invest.updateUserInvestment(
//           user,
//           existingInvestor,
//           post,
//           relevanceEarning,
//           amount
//         );
//       }

//       if (Math.abs(earnings.relevance) >= 1) {
//         relevanceEarning = earnings.relevance;

//         // add to relevance tag record
//         // TODO also do voter community
//         let relevance = await Relevance.updateUserRelevance(existingInvestor._id, post, earnings.relevance);
//         existingInvestor = await existingInvestor.updateRelevanceRecord(community);


//         // TODO - need to update relevance here and test
//         existingInvestor.relevance = relevance;
//         existingInvestor.updateClient();

//         let type = 'partialUpvote';
//         if (irrelevant) type = 'partialDownvote';

//         Notification.createNotification({
//           post: post._id,
//           forUser: existingInvestor._id,
//           byUser: earnings.fromUser,
//           amount: relevanceEarning,
//           type,
//           totalUsers: earnings.totalUsers,
//         });
//       }
//     } catch (err) {
//       console.log('error updating investors ', err);
//     }
//     console.log('updated previous investor');
//     return null;
//   });
//   return null;
// }

exports.InvestEvents = InvestEvents;

