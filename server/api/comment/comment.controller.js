import Community from 'server/api/community/community.model';
import { getMentions, getWords } from 'app/utils/text';
import { sendNotification as sendPushNotification } from 'server/notifications';
import socketEvent from 'server/socket/socketEvent';

const Post = require('../post/post.model');
const User = require('../user/user.model');
const Notification = require('../notification/notification.model');
const Invest = require('../invest/invest.model');

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

exports.create = async (req, res, next) => {
  let user = req.user._id;
  const { community, communityId } = req.communityMember;
  const { linkParent, text: body, tags, metaPost, parentComment } = req.body;

  let { parentPost, mentions = [], type } = req.body;

  type =
    type ||
    // TODO this is ugly
    (!parentComment || parentComment === parentPost ? 'post' : 'comment');

  const mentionsFromBody = getMentions(getWords(body));
  mentions = [...new Set([...mentions, ...mentionsFromBody])];

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
    comment = await comment.addUserInfo(user);
    comment = await comment.addPostData();

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, comment, user, comment);
    // if its a chat reply we need to process notificaitons

    if (type === 'chat') {
      comment = await comment.save();
      return await processChat({ res, parentComment, comment, user, type });
    }

    // if (type !== 'chat') {
    // await Invest.createVote({
    //   post: comment,
    //   user,
    //   amount: 0,
    //   relevanceToAdd: 0,
    //   community,
    //   communityId
    // });
    // }
    comment = await comment.addPostData();
    parentPost = await Post.findOne({ _id: parentPost });

    const updateTime = type === 'post' || false;
    await parentPost.updateRank({ communityId, updateTime });

    // updates parent comment count
    parentPost = await parentPost.save();
    parentPost.updateClient();

    await comment.save();
    res.status(200).json(comment);

    return processNotifications({
      parentPost,
      parentComment,
      comment,
      type,
      user,
      mentions
    });
  } catch (err) {
    return next(err);
  }
};

async function processChat({ res, parentComment, comment, user, type }) {
  if (!parentComment) return res.status(200).json(comment);

  // when its a reply
  // TODO nested replies? convo? will need parentThrea for this
  parentComment = await Post.findOne({ _id: parentComment });
  const commentAuthor = await User.findOne(
    { _id: parentComment.user },
    'name _id deviceTokens handle email notificationSettings'
  );

  await sendNotifications({
    commentor: commentAuthor,
    commentAuthor,
    user,
    comment,
    type
  });
  return res.status(200).json(comment);
}

async function processNotifications({
  parentPost,
  parentComment,
  comment,
  type,
  user,
  mentions
}) {
  parentComment = await Post.findOne({ _id: parentComment });

  const commentAuthor =
    parentComment &&
    (await User.findOne(
      { _id: parentComment.user },
      'name _id deviceTokens handle email notificationSettings'
    ));

  const postAuthor = await User.findOne(
    { _id: parentPost.user },
    'name _id deviceTokens handle email notificationSettings'
  );

  let otherCommentors = await Post.find({ parentPost: parentPost._id }).populate(
    'user',
    'name _id deviceTokens handle email notificationSettings'
  );

  otherCommentors = otherCommentors.map(comm => comm.user).filter(u => u);
  if (postAuthor) otherCommentors.push(postAuthor);
  if (commentAuthor) otherCommentors.push(commentAuthor);

  let voters = await Invest.find({ post: parentPost._id }).populate(
    'investor',
    'name _id deviceTokens handle email notificationSettings'
  );

  let commentVoters =
    parentComment &&
    (await Invest.find({ post: parentComment._id }).populate(
      'investor',
      'name _id deviceTokens handle email notificationSettings'
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

  otherCommentors = otherCommentors.filter(u => !mentions.find(m => m === u.handle));
  return otherCommentors.forEach(commentor =>
    sendNotifications({
      commentor,
      postAuthor,
      commentAuthor,
      user,
      comment,
      type
    })
  );
}

async function sendNotifications({
  commentor,
  postAuthor,
  commentAuthor,
  user,
  comment,
  type
}) {
  try {
    if (user._id.equals(commentor._id)) return;

    const ownPost = postAuthor && commentor._id.equals(postAuthor._id);
    const ownComment = commentAuthor && commentor._id.equals(commentAuthor._id);

    const noteType = !ownPost && !ownComment ? 'commentAlso' : 'comment';

    let note = {
      post: comment._id,
      forUser: commentor._id,
      byUser: user._id,
      amount: null,
      type: noteType,
      source: type,
      personal: true,
      read: false
    };

    note = new Notification(note);
    note = await note.save();

    const noteAction = {
      _id: commentor._id,
      type: 'ADD_ACTIVITY',
      payload: note
    };
    socketEvent.emit('socketEvent', noteAction);

    const action = ` replied to ${ownPost || ownComment ? 'your' : 'a'} ${type}`;

    // if (ownComment || ownPost) {
    //   sendCommentEmail({ commentor: user, comment, user: commentor, action });
    // }
    // const noteType = ownComment || ownPost ? 'personal' : 'general';

    const alert = user.name + action;
    const payload = {
      fromUser: user,
      toUser: commentor,
      post: comment,
      action,
      noteType: ownPost || ownComment ? 'reply' : 'general'
    };
    sendPushNotification(commentor, alert, payload);
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
