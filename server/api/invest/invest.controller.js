import { EventEmitter } from 'events';
import apnData from '../../pushNotifications';
import MetaPost from '../metaPost/metaPost.model';

let Post = require('../post/post.model');
let User = require('../user/user.model');
let Subscription = require('../subscription/subscription.model');
let Notification = require('../notification/notification.model');
let Invest = require('./invest.model');
let Relevance = require('../relevance/relevance.model');
// let Feed = require('../feed/feed.model');

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
  console.log(query, 'query');
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
    console.log(foundPost, 'foundpost');
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
  let user = req.user._id;
  let post = req.body.post;
  let amount = req.body.amount;
  let relevanceToAdd = 0;
  let existingInvestments = [];
  let irrelevant = false;
  if (amount < 0) irrelevant = true;
  let investmentExists;
  let subscription;
  let author;

  function InvestException(message) {
    this.message = message;
    this.name = 'InvestException';
  }

  async function updateInvestment() {
    await Invest.findOneAndUpdate(
      {
        investor: user._id,
        post: post._id
      },
      {
        investor: user._id,
        author: post.user,
        amount,
        relevantPoints: relevanceToAdd,
        post: post._id,
        ownPost: post.user === user._id,
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (investmentExists) {
      // TODO if also commented, increase investment?
      investmentExists.amount = amount;
    }

    console.log('adding ', relevanceToAdd, ' to post ', post._id);

    post.relevance += relevanceToAdd;
    post.rankRelevance += relevanceToAdd;
    if (irrelevant) {
      post.relevanceNeg += relevanceToAdd;
    }
    if (relevanceToAdd !== 0) {
      if (irrelevant) post.downVotes++;
      else post.upVotes++;
    }
    post.value += amount;
  }

  async function investCheck() {
    let type = 'upvote';
    if (amount < 0) {
      type = 'downvote';
      amount = -3;
    }

    if (user._id === post.user) {
      throw new InvestException('You can not ' + type + 'your own post');
    }

    if (COIN && user.balance < Math.abs(amount)) {
      throw new InvestException('coin');
    }

    if (!COIN && user.relevance < Math.abs(amount)) {
      throw new InvestException('You do not have enough relevance to ' + type + '!');
    }

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
        subscription.amount += 3;
        if (subscription.amount > 15) subscription.amount = 15;
      } else {
        subscription = new Subscription({
          follower: user._id,
          following: post.user,
          amount: 3,
        });
      }
      subscription = await subscription.save();
    }
    return subscription;
  }

  async function updateAuthor() {
    author = await User.findOne(
      { _id: post.user },
      'relevance balance name relevanceRecord deviceTokens badge'
    );

    let diff = user.relevance - author.relevance;
    let adjust = 1;
    if (diff > 0) adjust = Math.pow(diff, 1 / 3) + 1;
    if (irrelevant) adjust *= -1;
    adjust = Math.round(adjust);
    author.relevance += adjust;

    if (adjust !== 0) {
      author = author.updateRelevanceRecord();
      Relevance.updateUserRelevance(post.user, post, adjust);
    }

    let coin;
    if (COIN && amount > 0) {
      author.balance += amount;
      coin = amount;
    }

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
        apnData.sendNotification(author, alert, payload);
      } catch (err) {
        console.log(err);
      }
    }

    author = await author.save();

    author.updateClient(user);
    console.log('updated author');

    return author;
  }

  async function handleOtherInvestments() {
    try {
      existingInvestments = await Invest.find({ post: post._id, investor: { $nin: [user._id, post.user] } });
    } catch (err) {
      return console.log(err);
    }

    existingInvestments.forEach(async investment => {
      try {
        let existingInvestor = await User.findOne({ _id: investment.investor }, 'relevance');
        let ratio = 0.5 / existingInvestments.length;

        let relevanceEarning = 0;
        let earnings;

        if (relevanceToAdd !== 0) {
          let diff = user.relevance - existingInvestor.relevance;
          relevanceEarning = 1;
          if (diff > 0) relevanceEarning = Math.pow(diff, 1 / 3) + 1;

          let previousSign = investment.amount / Math.abs(investment.amount);
          let thisSign = amount / Math.abs(amount);
          relevanceEarning *= thisSign * previousSign;

          relevanceEarning *= ratio;

          if (relevanceEarning < 0.05) return null;
          earnings = await Invest.updateUserInvestment(user, existingInvestor, post, relevanceEarning, amount);
        }

        if (Math.abs(earnings.relevance) >= 1) {
          relevanceEarning = earnings.relevance;
          existingInvestor = existingInvestor.updateRelevanceRecord();
          existingInvestor.relevance += relevanceEarning;

          existingInvestor = await existingInvestor.save();
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

          // add to relevance tag record
          Relevance.updateUserRelevance(existingInvestor._id, post, earnings.relevance);
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
    post = await Post.findOne({ _id: post._id }, '-comments');
    // .populate('investments').exec();


    // ------ investor ------
    user = await User.findOne({ _id: user }, 'relevance name balance');


    // ------ get existing investment ------
    investmentExists = await investCheck(user, post);

    // ------- everything is fine, deduct user's relevance ---
    if (COIN) user.balance -= Math.abs(amount);
    else user.relevance -= Math.abs(amount);


    // ------ add or remove post to feed ------
    // await updateUserFeed(user, post, irrelevant);

    if (user.relevance < 0) relevanceToAdd = 0;
    else {
      relevanceToAdd = Math.round(Math.sqrt(user.relevance));
      relevanceToAdd = Math.max(1, relevanceToAdd);
    }
    if (irrelevant) relevanceToAdd *= -1;


    // ------ update investment records ------
    await updateInvestment();

    post = await post.save();

    // async update meta post rank
    MetaPost.updateRank(post.metaPost);

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
    updateAuthor();


    // updates previous user's relevance
    handleOtherInvestments();
  } catch (error) {
    console.log('invest error ', error);

    res.status(200).json({
      success: false,
      message: error.message
    });
    return;
  }

  console.log('sending invest response');
  res.status(200).json({
    success: true,
    subscription
  });
};

exports.InvestEvents = InvestEvents;

