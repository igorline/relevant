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

// COMMENTS ARE USING POST SCHEMA

exports.get = async (req, res, next) => {
  try {
    // TODO - not paginated
    const { community } = req.query.community;
    // const limit = parseInt(req.query.limit, 10) || 10;
    // const skip = parseInt(req.query.skip, 10) || 0;
    let query = null;
    let parentPost = null;
    const sort = 1;
    const id = req.user ? req.user._id : null;

    if (req.query.post) {
      parentPost = req.query.post;
      query = { parentPost };
    }

    const total = await Post.count(query);

    // if (total > 10) sort = -1;
    const comments = await Post.find(query)
    .populate({
      path: 'embeddedUser.relevance',
      select: 'pagerank',
      match: { community, global: true }
    })
    .populate({
      path: 'data',
      match: { community }
    })
    .sort({ createdAt: sort });
    // .limit(limit)
    // .skip(skip);

    const toSend = comments;
    // if (total > 10) toSend = comments.reverse();
    res.status(200).json({ data: toSend, total });

    // TODO worker thread
    if (id) {
      const postIds = [];
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

exports.delete = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const query = { _id: id, user: userId };
    const foundComment = await Post.findOne(query);
    if (!foundComment) throw new Error("Comment doesn't exist");
    if (foundComment.repost) {
      // remove the post that holds the repost
      await Post.findOne({ 'repost.comment': id }).remove();
    }

    const post = await Post.findOneAndUpdate(
      { _id: foundComment.parentPost },
      { $inc: { commentCount: -1 } },
      { new: true }
    ).exec();

    await foundComment.remove();

    post.updateClient();
    return res.json(200, true);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const comment = req.body;
    const { user } = req;
    const { mentions } = comment;
    let newMentions;

    const newComment = await Post.findOne({ _id: comment._id });

    if (newComment.user !== user._id) throw new Error("Can't edit other's comments");

    newComment.body = req.body.body;
    newMentions = mentions.filter(m => newComment.mentions.indexOf(m) < 0);
    newComment.mentions = mentions;
    newMentions = newMentions || [];

    if (newMentions.length) {
      const post = { _id: newComment.parentPost };
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
    const now = new Date().getTime();
    const { rank } = post;

    // keeps rank the same (may cause negative relevance);
    const newRelevance = 10 ** (rank - now / TENTH_LIFE) - 1;
    post.rankRelevance = newRelevance;
    post.postDate = now;

    const repostObj = {
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

    const subscribers = await Subscriptiton.find({
      following: user._id
      // category: newPostObj.category
    });

    // if its a repost, push the post to all subscribers
    // TODO only push if subscriber doesn't have this post already
    if (subscribers) {
      // save post here
      subscribers.forEach(async subscription => {
        if (subscription.amount < 1) {
          await subscription.remove();
        } else {
          subscription.amount -= 1;
          await Feed.findOneAndUpdate(
            {
              userId: subscription.follower,
              post: repost._id,
              metaPost: post.metaPost
            },
            { tags: post.tags, createdAt: new Date() },
            { upsert: true }
          ).exec();

          const newFeedPost = {
            _id: subscription.follower,
            type: 'INC_FEED_COUNT'
          };
          PostEvents.emit('post', newFeedPost);
        }
      });
    }
    return repost;
  } catch (err) {
    throw err;
  }
}

// for testing
exports.create = async (req, res, next) => {
  let user = req.user._id;
  const { community, communityId } = req.communityMember;
  const body = req.body.text;
  let parentPost = req.body.post;
  const { parentComment } = req.body;
  const { tags } = req.body;
  const mentions = req.body.mentions || [];
  const repost = req.body.repost || false;
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
    community,
    communityId
  };

  async function sendOutComments(commentor) {
    try {
      if (user._id === commentor._id) return;

      let type = 'comment';
      let ownPost = false;

      if (postAuthor && commentor._id.toString() === postAuthor._id.toString()) {
        ownPost = true;
      }
      type = !ownPost ? (type += 'Also') : type;

      if (repost && ownPost) type = 'repost';

      const dbNotificationObj = {
        post: parentPost._id,
        forUser: commentor._id,
        byUser: user._id,
        comment: comment._id,
        amount: null,
        type,
        personal: true,
        read: false
      };

      const newDbNotification = new Notification(dbNotificationObj);
      const note = await newDbNotification.save();

      const newNotifsObj = {
        _id: commentor._id,
        type: 'ADD_ACTIVITY',
        payload: note
      };
      CommentEvents.emit('comment', newNotifsObj);

      let action = ` commented on ${ownPost ? 'your' : 'a'} post`;
      if (comment.repost && ownPost) action = ' reposted your post';

      const alert = user.name + action;
      const payload = { commentFrom: req.user.name };
      apnData.sendNotification(commentor, alert, payload);
    } catch (err) {
      throw err;
    }
  }

  try {
    comment = new Post(commentObj);
    user = await User.findOne({ _id: user });

    parentPost = await Post.findOne({ _id: parentPost });

    if (repost) {
      comment = await createRepost(comment, parentPost, user);
    }

    // comment.community = parentPost.community;
    comment.aboutLink = parentPost.aboutLink;

    comment = await comment.addUserInfo(user);
    comment = await comment.addPostData();

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, parentPost, user, comment);

    await Invest.createVote({
      post: comment,
      user,
      amount: 1,
      relevanceToAdd: 0,
      community,
      communityId
    });

    // TODO increase the post's relevance? **but only if its user's first comment!
    // this auto-updates comment count
    parentPost = await parentPost.save();
    parentPost.updateClient();

    postAuthor = await User.findOne({ _id: parentPost.user }, 'name _id deviceTokens');

    let otherCommentors = await Post.find({ post: parentPost._id }).populate(
      'user',
      'name _id deviceTokens'
    );

    otherCommentors = otherCommentors.map(comm => comm.user).filter(u => u);
    otherCommentors.push(postAuthor);

    let voters = await Invest.find({ post: parentPost._id }).populate(
      'investor',
      'name _id deviceTokens'
    );
    voters = voters.map(v => v.investor);
    voters = voters || [];
    otherCommentors = otherCommentors || [];
    otherCommentors = [...otherCommentors, ...voters];
    // filter out nulls
    otherCommentors = otherCommentors.filter(u => u);

    // filter out duplicates
    otherCommentors = otherCommentors.filter((u, i) => {
      const index = otherCommentors.findIndex(c => (c ? c._id === u._id : false));
      return index === i;
    });

    await comment.save();
    res.status(200).json(comment);

    otherCommentors = otherCommentors.filter(u => !mentions.find(m => m === u._id));
    otherCommentors.forEach(sendOutComments);
  } catch (err) {
    next(err);
  }
};

exports.CommentEvents = CommentEvents;
