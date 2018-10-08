import { EventEmitter } from 'events';

const Post = require('../post/post.model');
const User = require('../user/user.model');
const Notification = require('../notification/notification.model');
const apnData = require('../../pushNotifications');
const Subscriptiton = require('../subscription/subscription.model');
const Feed = require('../feed/feed.model');
const Invest = require('../invest/invest.model');

const PostEvents = new EventEmitter();
const CommentEvents = new EventEmitter();
const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;


exports.get = async (req, res, next) => {
  try {
    // TODO - not paginated
    let community = req.query.community;
    // const limit = parseInt(req.query.limit, 10) || 10;
    // const skip = parseInt(req.query.skip, 10) || 0;
    let query = null;
    let parentPost = null;
    let sort = 1;
    let id = req.user ? req.user._id : null;

    if (req.query.post) {
      parentPost = req.query.post;
      query = { parentPost };
    }

    let total = await Post.count(query);

    // if (total > 10) sort = -1;
    let comments = await Post.find(query)
    .populate({
      path: 'embeddedUser.relevance',
      select: 'relevance',
      match: { community, global: true }
    })
    .sort({ createdAt: sort });
    // .limit(limit)
    // .skip(skip);

    let toSend = comments;
    // if (total > 10) toSend = comments.reverse();
    res.status(200).json({ data: toSend, total });

    // TODO worker thread
    if (id) {
      let postIds = [];
      comments.forEach(post => {
        postIds.push(post._id || post);
        if (post.repost && post.repost.post) {
          postIds.push(post.repost.post._id);
        }
      });
      Post.sendOutInvestInfo(postIds, id);
    }
  } catch (err) {
    next(err);
  }
};


exports.delete = async (req, res) => {
  const userId = req.user._id;
  const id = req.params.id;
  const query = { _id: id, user: userId };

  try {
    let foundComment = await Post.findOne(query);
    if (!foundComment) throw new Error('Comment doesn\'t exist');
    if (foundComment.repost) {
      // remove the post that holds the repost
      await Post.findOne({ 'repost.comment': id }).remove();
    }

    let post = await Post.findOneAndUpdate(
      { _id: foundComment.parentPost },
      { $inc: { commentCount: -1 } },
      { new: true }
    ).exec();

    await foundComment.remove();

    post.updateClient();
  } catch (error) {
    console.log(error);
    let message = 'error';
    if (error.message) message = error.message;
    return res.json(500, message);
  }

  return res.json(200, true);
};

exports.update = async (req, res, next) => {
  try {
    const comment = req.body;
    const user = req.user;

    let mentions = req.body.mentions;
    let newMentions;

    let newComment = await Post.findOne({ _id: comment._id });

    if (newComment.user !== user._id) throw new Error('Can\'t edit other\'s comments');

    newComment.body = req.body.body;
    newMentions = mentions.filter(m => newComment.mentions.indexOf(m) < 0);
    newComment.mentions = mentions;
    newMentions = newMentions || [];

    if (newMentions.length) {
      let post = { _id: newComment.parentPost };
      Post.sendOutMentions(mentions, post, newComment.user, newComment);
    }

    await newComment.save();

    res.json(200, newComment);
  } catch (err) {
    next(err);
  }
};


async function createRepost(comment, post, user) {
  try {
    let now = new Date().getTime();
    let rank = post.rank;

    // keeps rank the same (may cause negative relevance);
    let newRelevance = 10 ** (rank - now / TENTH_LIFE) - 1;
    post.rankRelevance = newRelevance;
    post.postDate = now;

    let repostObj = {
      user: user._id,
      metaPost: post.metaPost,
      postDate: new Date(),
      relevance: 0,
      parentPost: post._id,
      aboutLink: post.aboutLink,
      body: comment.body,
      type: 'repost',
      eligibleForRewards: true,
      repost: {
        post: post._id,
        commentBody: comment.body
      }
    };
    let repost = new Post(repostObj);

    repost = await repost.addUserInfo(user);
    repost = await repost.save();

    let subscribers = await Subscriptiton.find({
      following: user._id,
      // category: newPostObj.category
    });

    // if its a repost, push the post to all subscribers
    // TODO only push if subscriber doesn't have this post already
    if (subscribers) {
      // save post here
      subscribers.forEach(async (subscription) => {
        if (subscription.amount < 1) {
          await subscription.remove();
        } else {
          subscription.amount -= 1;
          await Feed.findOneAndUpdate(
            {
              userId: subscription.follower,
              post: repost._id,
              metaPost: post.metaPost,
            },
            { tags: post.tags, createdAt: new Date() },
            { upsert: true },
          ).exec();

          let newFeedPost = {
            _id: subscription.follower,
            type: 'INC_FEED_COUNT',
          };
          PostEvents.emit('post', newFeedPost);
        }
      });
    }
    return repost;
  } catch (err) {
    console.log('error creating repost', err);
  }
}


// for testing
exports.create = async (req, res) => {
  let user = req.user._id;
  const body = req.body.text;
  let parentPost = req.body.post;
  let parentComment = req.body.parentComment;

  const tags = req.body.tags;
  const mentions = req.body.mentions || [];
  let repost = req.body.repost || false;
  let comment;
  let postAuthor;

  const commentObj = {
    body,
    mentions,
    tags,
    parentPost,
    parentComment,
    user,
    type: 'comment',
    eligibleForRewards: true,
    postDate: new Date(),
  };

  async function sendOutComments(commentor) {
    try {
      if (user._id === commentor._id) return;

      let type = 'comment';
      let ownPost = false;

      if (postAuthor && commentor._id == postAuthor._id) ownPost = true;
      type = !ownPost ? type += 'Also' : type;

      if (repost && ownPost) type = 'repost';

      const dbNotificationObj = {
        post: parentPost._id,
        forUser: commentor._id,
        byUser: user._id,
        comment: comment._id,
        amount: null,
        type,
        personal: true,
        read: false,
      };

      const newDbNotification = new Notification(dbNotificationObj);
      let note = await newDbNotification.save();

      const newNotifsObj = {
        _id: commentor._id,
        type: 'ADD_ACTIVITY',
        payload: note,
      };
      CommentEvents.emit('comment', newNotifsObj);

      let action = ` commented on ${ownPost ? 'your' : 'a'} post`;
      if (comment.repost && ownPost) action = ' reposted your post';

      let alert = user.name + action;
      let payload = { commentFrom: req.user.name };
      apnData.sendNotification(commentor, alert, payload);
    } catch (err) {
      console.log('error sending comment notifications ', err);
    }
  }

  try {
    comment = new Post(commentObj);
    user = await User.findOne({ _id: user });

    parentPost = await Post.findOne({ _id: parentPost });


    if (repost) {
      comment = await createRepost(comment, parentPost, user);
    }

    comment.community = parentPost.community;
    comment.aboutLink = parentPost.aboutLink;

    comment = await comment.addUserInfo(user);

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, parentPost, user, comment);

    await Invest.createVote({
      post: comment,
      user,
      amount: 0,
      relevanceToAdd: 0,
    });

    // TODO increase the post's relevance? **but only if its user's first comment!
    // this auto-updates comment count
    parentPost = await parentPost.save();
    parentPost.updateClient();

    postAuthor = await User.findOne({ _id: parentPost.user }, 'name _id deviceTokens');


    let otherCommentors = await Post.find({ post: parentPost._id })
    .populate('user', 'name _id deviceTokens');

    otherCommentors = otherCommentors
    .map(comm => comm.user)
    .filter(u => u);
    otherCommentors.push(postAuthor);

    let voters = await Invest.find({ post: parentPost._id })
    .populate('investor', 'name _id deviceTokens');
    voters = voters.map(v => v.investor);
    voters = voters || [];
    otherCommentors = otherCommentors || [];
    otherCommentors = [...otherCommentors, ...voters];
    // filter out nulls
    otherCommentors = otherCommentors.filter(u => u);
    console.log('otherCommentors ', otherCommentors);

    // filter out duplicates
    otherCommentors = otherCommentors.filter((u, i) => {
      let index = otherCommentors.findIndex(c => c ? c._id === u._id : false);
      return index === i;
    });

    // filter out mentions
    console.log('mentions ', mentions);
    // console.log(otherCommentors);
    otherCommentors = otherCommentors.filter(u => {
      return !mentions.find(m => m === u._id);
    });
    // console.log(otherCommentors);

    otherCommentors.forEach(sendOutComments);

    await comment.save();
    res.status(200).json(comment);

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }

};

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err, 'error');
    res.status(statusCode).send(err);
  };
}

exports.CommentEvents = CommentEvents;
