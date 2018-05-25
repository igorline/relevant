import { EventEmitter } from 'events';

const Comment = require('./comment.model');
const Post = require('../post/post.model');
const MetaPost = require('../metaPost/metaPost.model');
const User = require('../user/user.model');
const Notification = require('../notification/notification.model');
const apnData = require('../../pushNotifications');
const Subscriptiton = require('../subscription/subscription.model');
const Feed = require('../feed/feed.model');
const Invest = require('../invest/invest.model');

const PostEvents = new EventEmitter();
const CommentEvents = new EventEmitter();
const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

// async function updateRepostMeta() {
//   try {
//     let reposts = await Post.find({ repost: { $exists: true } });
//   } catch (err) {
//     console.log(err);
//   }
// }
// updateRepostMeta();

exports.get = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = parseInt(req.query.skip, 10) || 0;
  let query = null;
  let post = null;
  let sort = 1;

  if (req.query.post) {
    post = req.query.post;
    query = { post };
  }

  Comment.count(query)
  .then((total) => {
    if (total > 10) sort = -1;
    Comment.find(query)
    .sort({ createdAt: sort })
    .limit(limit)
    .skip(skip)
    .exec((err, comments) => {
      if (err) {
        console.log(err, 'error getting comments');
        return res.send(500, err);
      }
      console.log('sending ', comments.length, ' comments');
      let toSend = comments;
      if (total > 10) toSend = comments.reverse();
      return res.status(200).json({ data: toSend, total });
    })
    .catch((error) => {
      let message = 'error';
      if (error.message) message = error.message;
      res.json(500, message);
    });
  })
  .catch((error) => {
    let message = 'error';
    if (error.message) message = error.message;
    res.json(500, message);
  });
};


exports.delete = async (req, res) => {
  const userId = req.user._id;
  const id = req.params.id;
  const query = { _id: id, user: userId };

  try {
    let foundComment = await Comment.findOne(query);
    if (foundComment.repost) {
      // remove the post that holds the repost
      await Post.findOne({ 'repost.comment': id }).remove();
    }

    let post = await Post.findOneAndUpdate(
      { _id: foundComment.post },
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

exports.update = (req, res) => {
  const comment = req.body;
  const user = req.user;

  let mentions = req.body.mentions;
  let newMentions;

  Comment.findOne({ _id: comment._id })
  .then((foundComment) => {
    let newComment = foundComment;
    if (newComment.user !== user._id) throw new Error('Can\'t edit other\'s comments');
    newComment.text = req.body.text;
    newMentions = mentions.filter(m => foundComment.mentions.indexOf(m) < 0);
    newComment.mentions = mentions;
    console.log('mentions ', mentions);
    newMentions = newMentions || [];
    if (newMentions.length) {
      let post = {
        _id: newComment.post
      };
      return Post.sendOutMentions(mentions, post, newComment.user, newComment);
    }
    return newComment.save();
  })
  .then(() =>
    Comment.findOne({ _id: comment._id })
  )
  .then((populatedComment) => {
    res.json(200, populatedComment);
  })
  .catch((error) => {
    let message = 'error';
    console.log(error, 'update error');
    if (error.message) message = error.message;
    return res.json(500, message);
  });
};

// for testing
exports.create = async (req, res) => {
  let user = req.user._id;
  const text = req.body.text;
  let post = req.body.post;
  const tags = req.body.tags;
  const mentions = req.body.mentions || [];
  let repost = req.body.repost || false;
  let comment;
  let postAuthor;
  let subscribers;

  const commentObj = {
    text,
    mentions,
    tags,
    post,
    user,
    repost
  };

  async function createRepost() {
    try {
      console.log('creating repost');
      let now = new Date().getTime();
      let rank = post.rank;

      // keeps rank the same (may cause negative relevance);
      let newRelevance = Math.pow(10, rank - (now / TENTH_LIFE)) - 1;
      post.rankRelevance = newRelevance;
      post.postDate = now;

      let repostObj = {
        user: user._id,
        metaPost: post.metaPost,
        postDate: new Date(),
        relevance: 0,
        rankRelevance: 0,
        embeddedUser: {
          handle: user.handle,
          name: user.name,
          image: user.image,
        },
        repost: {
          post: post._id,
          comment: comment._id,
          commentBody: comment.text
        }
      };
      repost = new Post(repostObj);
      repost = await repost.save();
      repost.upsertMetaPost(post.metaPost);

      subscribers = await Subscriptiton.find({
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
    } catch (err) {
      console.log('error creating repost', err);
    }
  }

  async function sendOutComments(commentor) {
    try {
      if (user._id != commentor._id) {
        let type = 'comment';
        let ownPost = false;

        if (commentor._id == postAuthor._id) ownPost = true;
        type = !ownPost ? type += 'Also' : type;

        if (comment.repost && ownPost) type = 'repost';

        const dbNotificationObj = {
          post: post._id,
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
      }
    } catch (err) {
      console.log('error sending comment notifications ', err);
    }
  }

  try {
    comment = new Comment(commentObj);
    user = await User.findOne({ _id: user });

    comment.embeddedUser = {
      handle: user.handle,
      name: user.name,
      image: user.image
    };

    post = await Post.findOne({ _id: post });

    // comment = await comment.save();

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, post, user, comment);

    // TODO increment post comment count here?
    // post.commentCount++;

    // TODO increase the post's relevance **but only if its user's first comment!
    // this auto-updates comment count
    post = await post.save();
    post.updateClient();

    if (comment.repost) createRepost();

    postAuthor = await User.findOne({ _id: post.user }, 'name _id deviceTokens');

    let otherCommentors = await Comment.find({ post: post._id })
    .populate('user', 'name _id deviceTokens');

    otherCommentors = otherCommentors
    .map(comm => comm.user)
    .filter(u => u);
    otherCommentors.push(postAuthor);

    let voters = await Invest.find({ post: post._id })
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
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }

  res.status(200).json(comment);
};

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err, 'error');
    res.status(statusCode).send(err);
  };
}

exports.CommentEvents = CommentEvents;
