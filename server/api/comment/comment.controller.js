import { EventEmitter } from 'events';
import Community from 'server/api/community/community.model';

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
    // TODO - pagination
    // const limit = parseInt(req.query.limit, 10) || 10;
    // const skip = parseInt(req.query.skip, 10) || 0;

    const { community } = req.query;
    const cObj = await Community.findOne({ slug: community }, '_id');
    const communityId = cObj._id;

    let query = null;
    let parentPost = null;
    const id = req.user ? req.user._id : null;

    if (req.query.post) {
      parentPost = req.query.post;
      query = { parentPost, hidden: { $ne: true }, communityId };
    }

    const total = await Post.count(query);

    const comments = await Post.find(query)
    .populate({
      path: 'embeddedUser.relevance',
      select: 'pagerank',
      match: { communityId, global: true }
    })
    .populate({
      path: 'data',
      match: { communityId }
    })
    .sort({ pagerank: -1, createdAt: 1 });

    const toSend = comments;
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

// for testing
exports.create = async (req, res, next) => {
  let user = req.user._id;
  const { community, communityId } = req.communityMember;
  const {
    linkParent,
    text: body,
    tags,
    mentions = [],
    repost = false,
    metaPost
  } = req.body;
  let { parentPost, parentComment } = req.body;

  const type = !parentComment || parentComment === parentPost ? 'post' : 'comment';

  const commentObj = {
    body,
    mentions,
    tags,
    parentPost,
    linkParent,
    parentComment,
    user,
    type,
    eligibleForRewards: true,
    postDate: new Date(),
    community,
    communityId,
    metaPost
  };

  try {
    let comment = new Post(commentObj);
    user = await User.findOne({ _id: user });

    parentPost = await Post.findOne({ _id: parentPost });
    parentComment = await Post.findOne({ _id: parentComment });

    if (repost) comment = await createRepost(comment, parentPost, user);

    comment = await comment.addUserInfo(user);
    comment = await comment.addPostData();

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, comment, user, comment);

    await Invest.createVote({
      post: comment,
      user,
      amount: 0,
      relevanceToAdd: 0,
      community,
      communityId
    });

    // TODO increase the post's relevance? **but only if its user's first comment!
    const updateTime = type === 'post' || false;
    await parentPost.updateRank({ communityId, updateTime });
    parentPost = await parentPost.save();
    parentPost.updateClient();

    const postAuthor = await User.findOne(
      { _id: parentPost.user },
      'name _id deviceTokens'
    );
    const commentAuthor =
      parentComment &&
      (await User.findOne({ _id: parentComment.user }, 'name _id deviceTokens'));

    let otherCommentors = await Post.find({ parentPost: parentPost._id }).populate(
      'user',
      'name _id deviceTokens'
    );

    otherCommentors = otherCommentors.map(comm => comm.user).filter(u => u);
    if (postAuthor) otherCommentors.push(postAuthor);
    if (commentAuthor) otherCommentors.push(commentAuthor);

    let voters = await Invest.find({ post: parentPost._id }).populate(
      'investor',
      'name _id deviceTokens'
    );

    let commentVoters =
      parentComment &&
      (await Invest.find({ post: parentComment._id }).populate(
        'investor',
        'name _id deviceTokens'
      ));

    commentVoters = commentVoters ? commentVoters.map(v => v.investor) : [];
    voters = voters.map(v => v.investor);
    otherCommentors = [...otherCommentors, ...voters, ...commentVoters];
    otherCommentors = otherCommentors.filter(u => u);

    // filter out duplicates
    otherCommentors = otherCommentors.filter((u, i) => {
      const index = otherCommentors.findIndex(c => (c ? c._id.equals(u._id) : false));
      return index === i;
    });

    await comment.save();
    res.status(200).json(comment);

    otherCommentors = otherCommentors.filter(u => !mentions.find(m => m === u.handle));
    otherCommentors.forEach(commentor =>
      sendNotifications({
        commentor,
        postAuthor,
        commentAuthor,
        repost,
        parentPost,
        user,
        comment,
        type
      })
    );
  } catch (err) {
    next(err);
  }
};

async function sendNotifications({
  commentor,
  postAuthor,
  commentAuthor,
  repost,
  user,
  comment,
  type
}) {
  try {
    if (user._id.equals(commentor._id)) return;

    const ownPost = postAuthor && commentor._id.equals(postAuthor._id);
    const ownComment = commentAuthor && commentor._id.equals(commentAuthor._id);

    const noteType = !ownPost && !ownComment ? 'commentAlso' : 'comment';

    if (repost && ownPost) type = 'repost';

    const dbNotificationObj = {
      post: comment._id,
      forUser: commentor._id,
      byUser: user._id,
      amount: null,
      type: noteType,
      source: type,
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

    let action = ` commented on ${ownPost || ownComment ? 'your' : 'a'} ${type}`;
    if (comment.repost && ownPost) action = ` reposted your ${type}`;

    const alert = user.name + action;
    const payload = { commentFrom: user.name };
    apnData.sendNotification(commentor, alert, payload);
  } catch (err) {
    throw err;
  }
}

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

exports.update = async (req, res, next) => {
  try {
    const comment = req.body;
    const { user } = req;
    const { mentions } = comment;
    let newMentions;

    const newComment = await Post.findOne({ _id: comment._id });
    if (!user._id.equals(newComment.user)) throw new Error("Can't edit other's comments");

    newComment.body = req.body.body;
    newMentions = mentions.filter(m => newComment.mentions.indexOf(m) < 0);
    newComment.mentions = mentions;
    newMentions = newMentions || [];

    if (newMentions.length) {
      Post.sendOutMentions(mentions, newComment, newComment.user, newComment);
    }

    await newComment.save();

    res.json(200, newComment);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const query = { _id: id, user: userId };
    const comment = await Post.findOne(query);
    if (!comment) throw new Error("Comment doesn't exist");
    if (comment.repost) {
      await Post.findOne({ 'repost.comment': id }).remove();
    }

    const post = await Post.findOneAndUpdate(
      { _id: comment.parentPost },
      { $inc: { commentCount: -1 } },
      { new: true }
    ).exec();

    await comment.remove();

    if (post) post.updateClient();
    return res.json(200, true);
  } catch (err) {
    return next(err);
  }
};

exports.CommentEvents = CommentEvents;
