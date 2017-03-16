import { EventEmitter } from 'events';

const Comment = require('./comment.model');
const Post = require('../post/post.model');
const MetaPost = require('../metaPost/metaPost.model');
const User = require('../user/user.model');
const Notification = require('../notification/notification.model');
const apnData = require('../../pushNotifications');
const Subscriptiton = require('../subscription/subscription.model');
const Feed = require('../feed/feed.model');

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
      return res.json(200, { data: toSend, total });
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
      { $pull: { comments: foundComment._id }, $inc: { commentCount: -1 } },
      { new: true }
    ).exec();

    await foundComment.remove();

    post.updateClient();
  } catch (error) {
    let message = 'error';
    if (error.message) message = error.message;
    res.json(500, message);
  }

  res.json(200, true);
};

exports.update = (req, res) => {
  const comment = req.body;
  Comment.findOne({ _id: comment._id })
  .then((foundComment) => {
    let newComment = foundComment;
    newComment.text = req.body.text;
    return foundComment.save();
  })
  .then(() =>
    Comment.findOne({ _id: comment._id })
    .populate('user', '_id image name relevance balance')
  )
  .then((populatedComment) => {
    res.json(200, populatedComment);
  })
  .catch((error) => {
    let message = 'error';
    console.log(error, 'update error');
    if (error.message) message = error.message;
    res.json(500, message);
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
        postTime: new Date(),
        relevance: 0,
        rankRelevance: 0,
        embeddedUser: {
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

  try {
    comment = new Comment(commentObj);
    user = await User.findOne({ _id: user });

    comment.embeddedUser = {
      name: user.name,
      image: user.image
    };
    comment = await comment.save();

    post = await Post.findOne({ _id: post });

    if (!post.comments) post.comments = [];
    post.comments.push(comment._id);
    post.commentCount++;

    // TODO increase the post's relevance **but only if its user's first comment!
    post = await post.save();
    post.updateClient();

    if (comment.repost) createRepost();

    postAuthor = await User.findOne({ _id: post.user });

    let otherCommentors = await Comment.find({ post: post._id })
    .populate('user', 'name _id deviceTokens');

    otherCommentors = otherCommentors.map(comm => comm.user);
    otherCommentors.push(postAuthor);
    otherCommentors = otherCommentors.filter((u, i) => {
      let index = otherCommentors.findIndex(c => c._id === u._id);
      return index === i;
    });


    otherCommentors.forEach(async commentor => {
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

          let action = `${!ownPost ? 'also' : ''} commented on ${ownPost ? 'your' : 'a'} post`;
          if (comment.repost && ownPost) action = 'reposted your post';

          let alert = commentor.name + action;
          let payload = { commentFrom: req.user.name };
          apnData.sendNotification(commentor, alert, payload);
        }
      } catch (err) {
        console.log('error sending comment notifications ', err);
      }
    });

    Post.sendOutMentions(mentions, post, user, 'comment');
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
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
