import { EventEmitter } from 'events';
import apnData from '../../pushNotifications';
import { VOTE_COST_RATIO, POWER_REGEN_INTERVAL } from '../../config/globalConstants';
import * as ethUtils from '../../utils/ethereum';

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
  let postId = req.params.postId;
  let limit = parseInt(req.query.limit, 10);
  let skip = parseInt(req.query.skip, 10);
  let investments;

  try {
    investments = await Invest.find({ post: postId, ownPost: false })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate({
      path: 'investor',
      select: 'relevance name image'
    });

    // investments = investments.map(inv => {
    //   inv = inv.toObject();
    //   if (inv.amount < 1) inv.investor = { name: 'Someone' };
    //   return inv;
    // });

    // investments = investments.filter(inv => inv.investor ? inv.author != inv.investor._id : true);
  } catch (err) {
    handleError(res, err);
  }
  return res.status(200).json(investments);
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

exports.show = async (req, res) => {
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

  try {
    investments = await Invest.find(query)
    .populate({
      path: 'post',
      populate:
      {
        path: 'user',
        select: 'name image relevance',
      }
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);
    res.status(200).json(investments);
  } catch (err) {
    handleError(res, err);
  }

  let postIds = investments.map(inv => inv.post ? inv.post._id : null);
  postIds = postIds.filter(postId => postId);
  Post.sendOutInvestInfo(postIds, id);
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

exports.create = async (req, res) => {
  let { community, communityId } = req.communityMember;

  let user = req.user._id;
  let post = req.body.post;
  let amount = req.body.amount;
  // amount should be on a scale of -1 to 1 to prevent abuse;
  amount = Math.max(-1, amount);
  amount = Math.min(1, amount);
  let relevanceToAdd = 0;
  let existingInvestments = [];
  let irrelevant = false;
  if (amount < 0) irrelevant = true;
  let investmentExists;
  let subscription;
  let author;
  let userRelevance;

  function InvestException(message) {
    this.message = message;
    this.name = 'InvestException';
  }

  async function updateInvestment() {
    Invest.createVote({
      post, user, amount, relevanceToAdd
    });

    // TODO deal with this later
    if (investmentExists) {
      // TODO if also commented, increase investment?
      investmentExists.amount = amount;
    }

    console.log('adding ', relevanceToAdd, ' to post ', post._id);

    post.data.relevance += relevanceToAdd;
    communityId.toString() === post.communityId.toString() ?
      post.relevance = post.data.relevance : null;
    if (irrelevant) {
      post.data.relevanceNeg += relevanceToAdd;
      communityId.toString() === post.communityId.toString() ?
        post.relevanceNeg = post.data.relevanceToAdd : null;
    }
    if (relevanceToAdd !== 0) {
      if (irrelevant) post.data.downVotes++;
      else post.data.upVotes++;
    }
    console.log('post relevance', post.relevance);
    post.data.value += 1;
  }

  async function investCheck() {
    let type = 'upvote';
    if (amount < 0) {
      type = 'downvote';
      amount = -3;
      let now = new Date();
      // don't let users downvote posts older than one week
      if (post.data.postDate < now.getTime() - 1000 * 60 * 60 * 24 * 7) {
        throw new InvestException('you cannot downvote posts older than one week');
      }
    }

    if (user._id === post.user) {
      throw new InvestException('You can not ' + type + 'your own post');
    }

    // if (user.relevance < Math.abs(amount)) {
    //   throw new InvestException('You do not have enough relevance to ' + type + '!');
    // }

    let investment = await Invest.findOne({ investor: user._id, post: post._id });

    // TODO undo invest
    // let now = new Date();
    // && new Date(investment.createdAt).getTime() + (1000 * 15) < now.getTime()
    if (investment) {
      console.log('user already invested in post');
      relevanceToAdd = 0;
      let string = 'relevant';
      if (investment.amount < 0) string = 'irrelevant';
      throw new InvestException('You have already marked this post as ' + string);
    }
    // else if (investment) {
    //   //undo invest
    //   investment.remove();
    //   user.relevance += 1;
    // }
    return investment;
  }

  async function updateSubscriptions() {
    if (irrelevant) {
      subscription = null;
    } else {
      subscription = await Subscription.findOne({
        follower: user._id,
        following: post.user,
      });

      if (subscription) {
        subscription.amount += 4;
        if (subscription.amount > 20) subscription.amount = 20;
      } else {
        subscription = new Subscription({
          follower: user._id,
          following: post.user,
          amount: 4,
        });
      }
      subscription = await subscription.save();
    }
    return subscription;
  }

  async function updateAuthor() {
    // TODO do we really need to query for author?
    author = await User.findOne(
      { _id: post.user },
      'relevance balance name relevanceRecord deviceTokens badge image'
    );

    if (!author) return null;

    let authorRelevance = await Relevance.findOne({
      community,
      global: true,
      user: post.user
    }, 'relevance');
    authorRelevance = authorRelevance ? authorRelevance.relevance : 0;


    let diff = userRelevance - authorRelevance;

    let adjust = 1;
    if (diff > 0) adjust = (diff ** (1 / 4)) + 1;
    if (irrelevant) adjust *= -1;

    // adjust = Math.round(adjust);
    if (userRelevance < 0) {
      adjust = 0;
    }
    // TEST THIS
    // TODO remove - depricated
    authorRelevance += adjust;

    if (adjust !== 0) {
      authorRelevance = await Relevance.updateUserRelevance(post.user, post, adjust);
      author = await author.updateRelevanceRecord(community);
      // TODO update author community rel
    }

    let coin;

    // don't send coint to author on upvote
    // add to reward fund instead
    // if (amount > 0) {
    //   author.balance += amount;
    //   coin = amount;
    // }

    console.log('adding ', adjust, ' relevance to ', author.name);

    let type = 'upvote';
    if (irrelevant) type = 'downvote';

    // update user's earnings status
    await Invest.updateUserInvestment(user, author, post, adjust, amount);

    if (!irrelevant) {
      Notification.createNotification({
        post: post._id,
        forUser: author._id,
        byUser: user._id,
        amount: adjust,
        type,
        coin,
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

    author = await author.save();

    // temp relevance storage for update
    author.relevance = authorRelevance;
    author.updateClient(user);

    return author;
  }

  async function handleOtherInvestments() {
    try {
      existingInvestments = await Invest.find({
        post: post._id,
        investor: { $nin: [user._id, post.user] }
      });
    } catch (err) {
      return console.log(err);
    }

    existingInvestments.forEach(async investment => {
      try {
        let existingInvestor = await User.findOne({ _id: investment.investor }, 'relevance name image');
        let ratio = 1 / existingInvestments.length;

        let relevanceEarning = 0;
        let earnings;

        // need this to determine relevance increase;
        // TODO also do voter community
        let existingInvestorRelevance = await Relevance.findOne({
          community,
          user: investment.investor,
          global: true
        }, 'relevance');
        existingInvestorRelevance = existingInvestorRelevance ?
          existingInvestorRelevance.relevance :
          0;

        if (relevanceToAdd !== 0) {
          let diff = userRelevance - existingInvestorRelevance;

          relevanceEarning = 1;
          if (diff > 0) relevanceEarning = Math.pow(diff, 1 / 4) + 1;
          console.log('adding relevance of ', relevanceEarning, ' to ', existingInvestor._id);

          // TODO: test this
          if (userRelevance < 0) relevanceEarning = 0;

          let previousSign = investment.amount / Math.abs(investment.amount);
          let thisSign = amount / Math.abs(amount);
          relevanceEarning *= thisSign * previousSign;

          relevanceEarning *= ratio;

          if (relevanceEarning < 0.05) return null;
          earnings = await Invest.updateUserInvestment(
            user,
            existingInvestor,
            post,
            relevanceEarning,
            amount
          );
        }

        if (Math.abs(earnings.relevance) >= 1) {
          relevanceEarning = earnings.relevance;

          // add to relevance tag record
          // TODO also do voter community
          let relevance = await Relevance.updateUserRelevance(existingInvestor._id, post, earnings.relevance);
          existingInvestor = await existingInvestor.updateRelevanceRecord(community);

          // TODO remove deprecated
          existingInvestor.relevance += relevanceEarning;
          existingInvestor = await existingInvestor.save();

          // TODO - need to update relevance here and test
          existingInvestor.relevance = relevance;
          existingInvestor.updateClient();

          let type = 'partialUpvote';
          if (irrelevant) type = 'partialDownvote';

          Notification.createNotification({
            post: post._id,
            forUser: existingInvestor._id,
            byUser: earnings.fromUser,
            amount: relevanceEarning,
            type,
            totalUsers: earnings.totalUsers,
          });
        }
      } catch (err) {
        console.log('error updating investors ', err);
      }
      console.log('updated previous investor');
      return null;
    });
    return null;
  }

  console.log('START INVEST');

  try {
    // ------ post ------
    post = await Post.findOne({ _id: post._id }, '-comments')
    .populate({ path: 'parentPost' })
    .populate({ path: 'data', match: { communityId } });
    // .populate('investments').exec();
    // postCommunity = post.community || 'relevant';

    // ------ investor ------
    user = await User.findOne(
      { _id: user },
      'relevance name balance ethAddress image lastVote votePower handle tokenBalance'
    );

    user = user.updatePower();

    // ------ get existing investment ------
    investmentExists = await investCheck(user, post);

    userRelevance = await Relevance.findOne(
      { user: user._id, community, global: true },
      'relevance'
    );
    userRelevance = userRelevance ? userRelevance.relevance : 0;

    // ------ add or remove post to feed ------
    // await updateUserFeed(user, post, irrelevant);

    if (userRelevance < 0) relevanceToAdd = 0;
    else {
      // use sqrt function for post relevance
      relevanceToAdd = Math.round(Math.sqrt(userRelevance));
      relevanceToAdd = Math.max(1, relevanceToAdd);
    }
    if (irrelevant) relevanceToAdd *= -1;


    // ------ update investment records ------
    await updateInvestment();

    post.data = await post.data.save();
    // console.log('updated post data: ', post.data);

    await post.updateRank(community);
    post = await post.save();

    if (post.parentPost) {
      // TODO - work on nesting here
      // TODO source community?
      await post.parentPost.updateRank(community);
      await post.parentPost.save();
    }

    // TODO handle twitter upvote

    // updates user investments
    user.investmentCount = await Invest.count({ investor: user._id, amount: { $gt: 0 } });

    // update subscriptions
    user = await user.getSubscriptions();
    user = await user.save();

    user.updateClient();

    post.updateClient();


    // update subscriptions
    await updateSubscriptions();

    // updates author relevance
    await updateAuthor();

    // updates previous user's relevance
    handleOtherInvestments();
  } catch (error) {
    handleError(res, error);
    return;
  }

  console.log('sending invest response');
  res.status(200).json({
    success: true,
    subscription
  });
};

exports.InvestEvents = InvestEvents;

