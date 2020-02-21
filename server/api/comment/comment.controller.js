import Community from 'server/api/community/community.model';
import { getMentions, getWords, getTags } from 'app/utils/text';
import { sendNotification as sendPushNotification } from 'server/notifications';
import socketEvent from 'server/socket/socketEvent';
import Post from 'server/api/post/post.model';
import User from 'server/api/user/user.model';
import Notification from 'server/api/notification/notification.model';
import Invest from 'server/api/invest/invest.model';
import { checkCommunityAuth } from 'server/api/community/community.auth';

// COMMENTS ARE USING POST SCHEMA
exports.index = async req => {
  // TODO - pagination
  // const limit = parseInt(req.query.limit, 10) || 10;
  // const skip = parseInt(req.query.skip, 10) || 0;
  const { user } = req;
  const { community, post } = req.query;
  if (!post) throw Error('missing parent post id');

  const cObj = await Community.findOne({ slug: community }, '_id');
  const communityId = cObj._id;

  const query = { parentPost: post, hidden: { $ne: true }, communityId };

  const myVote = user
    ? [
        {
          path: 'myVote',
          match: { investor: user._id, communityId }
        }
      ]
    : [];

  const comments = await Post.find(query)
    .populate([
      ...myVote,
      {
        path: 'embeddedUser.relevance',
        select: 'pagerank',
        match: { communityId }
      },
      {
        path: 'data',
        match: { communityId }
      }
    ])
    .sort({ pagerank: -1, createdAt: 1 });

  return { data: comments.map(c => c.toObject()) };
};

exports.create = async (req, res, next) => {
  try {
    let user = req.user._id;
    const { communityMember } = req;

    const { community, communityId } = communityMember;

    if (community === 'foam')
      await checkCommunityAuth({ user: req.user, communityId, communityMember });

    const { linkParent, text: body, metaPost } = req.body;
    let { parentPost, parentComment, mentions = [], tags = [] } = req.body;

    const type =
      req.body.type || !parentComment || parentComment === parentPost
        ? 'post'
        : 'comment';

    const words = getWords(body);
    const mentionsFromBody = getMentions(words);
    const tagsFromBody = getTags(words);

    tags = [...new Set([...tags, ...tagsFromBody])];
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

    let comment = new Post(commentObj);
    user = await User.findOne({ _id: user });

    if (user.banned) {
      throw new Error(
        'You are temporarily blocked from making comments, if you think this is an error, please reach out to info@relevant.community'
      );
    }

    parentPost = await Post.findOne({ _id: parentPost });
    parentComment = await Post.findOne({ _id: parentComment });

    comment = await comment.addUserInfo(user);
    comment = await comment.addPostData();

    // this will also save the new comment
    comment = await Post.sendOutMentions(mentions, comment, user, comment);
    // if its a chat reply we need to process notificaitons

    if (type === 'chat') {
      comment = await comment.save();
      return await processChat({ res, parentComment, comment, user, type });
    }

    const updateTime = type === 'post' || false;
    await parentPost.updateRank({ communityId, updateTime });

    if (tags && tags.length) {
      parentPost = await parentPost.addTags({ tags, communityId });
    }

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

  let action = ` replied to ${ownPost || ownComment ? 'your' : 'a'} ${type}`;
  if (type === 'repost' && ownPost) action = ` reposted your ${type}`;

  const alert = user.name + action;
  const payload = {
    fromUser: user,
    toUser: commentor,
    post: comment,
    action,
    noteType: ownPost || ownComment ? 'reply' : 'general'
  };
  sendPushNotification(commentor, alert, payload);
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
