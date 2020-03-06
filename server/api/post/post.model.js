import { pubsub } from 'server/graphql/pubsub';
import { UPDATE_UNREAD } from 'server/api/community/member.schema';

const mongoose = require('mongoose');
const socketEvent = require('server/socket/socketEvent').default;

const { Schema } = mongoose;
const { sendNotification } = require('server/notifications');

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

const PostSchema = new Schema(
  {
    body: String,
    title: String,
    description: String,
    channel: { type: Boolean, default: false },
    community: String,
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    tags: [{ type: String, ref: 'Tag' }],
    category: { type: String, ref: 'Tag' },
    repost: {
      post: { type: Schema.Types.ObjectId, ref: 'Post' },
      comment: { type: Schema.Types.ObjectId, ref: 'Post' },
      commentBody: String
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    embeddedUser: {
      _id: String,
      handle: String,
      name: String,
      image: String
    },

    flagged: { type: Boolean, default: false },
    flaggedBy: [{ type: String, ref: 'User', select: false }],
    flaggedTime: Date,
    mentions: [{ type: String, ref: 'User' }],

    // store link info here
    metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
    url: { type: String, unique: false },
    inputUrl: { type: String, unique: false },
    image: { type: String },

    // TEMP Deprecate remove after migrate 0.20
    link: { type: String, unique: false },

    // Should be array of links used instead of metaPost
    // TODO: Implement this
    links: [
      {
        text: String,
        href: String,
        position: Number,
        metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' }
      }
    ],

    // aboutLink: { type: Schema.Types.ObjectId, ref: 'Post' },
    linkParent: { type: Schema.Types.ObjectId, ref: 'Post' },
    // top-level comments have parent
    parentPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    // replies have parent comment
    parentComment: { type: Schema.Types.ObjectId, ref: 'Post' },

    postDate: { type: Date, index: true },
    latestComment: { type: Date, index: true },
    commentCount: { type: Number, default: 0 },

    // todo should be diff table - diff communities will have diff payouts

    rank: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    pagerank: { type: Number, default: 0 },
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },

    paidOut: { type: Boolean, default: false },
    payoutTime: { type: Date },

    // TODO twitter stuff should go into data model
    twitter: { type: Boolean, default: false },
    // Use this to hide twitter posts
    // TODO this should also go into a data model
    // and data should be used to query community feed
    hidden: { type: Boolean, default: false },
    twitterUser: Number,
    twitterId: Number,
    twitterScore: { type: Number, default: 0 },
    // feedRelevance: Number,
    twitterUrl: String,
    seenInFeedNumber: { type: Number, default: 0 },

    // link, comment, repost, post
    type: { type: String, default: 'post' },

    version: { type: String, default: 'metaRework' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

PostSchema.virtual('myVote', {
  ref: 'Invest',
  localField: '_id',
  foreignField: 'post',
  justOne: true
});

PostSchema.virtual('reposted', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'repost.post'
});

PostSchema.virtual('commentary', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'parentPost'
});

PostSchema.virtual('embeddedUser.relevance', {
  ref: 'CommunityMember',
  localField: 'user',
  foreignField: 'user',
  justOne: true
});

PostSchema.virtual('data', {
  ref: 'PostData',
  localField: '_id',
  foreignField: 'post',
  justOne: true
});

PostSchema.virtual('children', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'parentPost',
  justOne: false
});

PostSchema.index({ twitter: 1 });
PostSchema.index({ parentPost: 1, hidden: 1 });
PostSchema.index({ parentPost: 1, pagerank: 1, hidden: 1 });

PostSchema.index({ twitter: 1, twitterId: 1 });

PostSchema.index({ rank: 1 });
PostSchema.index({ postDate: -1 });
PostSchema.index({ postDate: -1, community: 1 });

PostSchema.index({ postDate: -1, communitId: 1, parentPost: 1 });
PostSchema.index({ _id: 1, community: 1, user: 1 });

PostSchema.index({ _id: 1, user: 1 });
PostSchema.index({ _id: -1, communityId: 1, user: 1 });

PostSchema.index({ communityId: 1, user: 1 });
PostSchema.index({ postDate: -1, tags: 1 });
PostSchema.index({ rank: 1, tags: 1 });
PostSchema.index({ paidOut: 1, payoutTime: 1 });

PostSchema.pre('save', async function save(next) {
  try {
    const countQuery = { parentPost: this._id, hidden: false };
    this.commentCount = await this.model('Post').countDocuments(countQuery);
    return next();
  } catch (err) {
    console.log('error updating post count', err); // eslint-disable-line
    return next();
  }
});

PostSchema.methods.addPostData = async function addPostData(postObject) {
  const eligibleForReward = !this.parentPost && !this.twitter;
  const now = new Date();
  const data = new (this.model('PostData'))({
    eligibleForReward,
    hidden: this.hidden,
    type: this.type,
    parentPost: this.parentPost,
    postDate: now, // if we are creating post data object date is new!
    payoutTime: postObject ? postObject.payoutTime : this.payoutTime,
    // payoutTime: this.payoutTime,
    // postDate: this.postDate || this.createdAt,
    post: this._id,
    community: postObject ? postObject.community : this.community,
    communityId: postObject ? postObject.communityId : this.communityId,
    relevance: this.relevance,
    rank: this.rank,
    relevanceNeg: this.relevanceNeg,
    latestComment: this.latestComment || this.postDate,
    tags: this.tags
  });

  await data.save();
  this.data = data;
  return this;
};

PostSchema.methods.updateClient = function updateClient(user) {
  if (this.user && this.user._id) this.user = this.user._id;
  const post = this.toObject();
  // Prevent over-writing post object
  // TODO - normalize on client instead
  if (post.parentPost && post.parentPost._id) {
    post.parentPost = post.parentPost._id;
  }
  const postNote = {
    _id: user ? user._id : null,
    type: 'UPDATE_POST',
    payload: post
  };
  socketEvent.emit('socketEvent', postNote);
};

PostSchema.methods.addUserInfo = async function addUserInfo(user) {
  this.embeddedUser = {
    id: user._id,
    _id: user._id,
    handle: user.handle,
    name: user.name,
    image: user.image
  };

  return this;
};

async function updateLatestComment({ post, communityId }) {
  if (post.parentPost) return post;

  const latestComment = await post
    .model('Post')
    .findOne(
      { parentPost: post._id, communityId, hidden: { $ne: true }, type: 'post' },
      'postDate'
    )
    .sort({ postDate: -1 });

  if (!latestComment) return post;

  post.data.latestComment = latestComment.postDate;
  post.latestComment = latestComment.postDate;

  return post;
}

// TODO work on this
PostSchema.methods.updateRank = async function updateRank({ communityId, updateTime }) {
  let post = this;
  try {
    if (!post.data) {
      post.data = await post.model('PostData').findOne({ post: post._id, communityId });
    }
    const { pagerank } = post.data;

    if (updateTime && !post.parentPost) {
      post = await updateLatestComment({ post, communityId });
    }

    // Don't use latestComment to compute post rank!
    if (!post.data.postDate) post.data.postDate = post.postDate;
    const { postDate } = post.data;

    let rank =
      pagerank < 0 ? 0 : postDate.getTime() / TENTH_LIFE + Math.log10(pagerank + 1);
    rank = Math.round(rank * 1000) / 1000;

    // But if a comment ranks highly - update post rank
    const topComment = await post
      .model('PostData')
      .findOne({ parentPost: post._id, communityId }, 'rank pagerank')
      .sort({ rank: -1 });

    if (topComment) rank = Math.max(rank, topComment.rank);

    post.data.rank = rank;

    // TODO - deprecate this once we don't use this in the feed
    // post.rank = rank;
    // if (post.communityId && post.communityId.toString() === communityId.toString()) {
    //   post.pagerank = post.data.pagerank;
    //   // console.log('updating post pagerank', post.pagerank);
    // }

    await post.data.save();
    await post.save();
    return post;
  } catch (err) {
    console.log(err); // eslint-disable-line
    return post;
  }
};

PostSchema.statics.newLinkPost = async function newLinkPost({ linkObject, postObject }) {
  const {
    tags,
    postDate,
    payoutTime,
    hidden,
    image,
    title,
    url,
    communityId
  } = postObject;

  let post = await this.model('Post')
    .findOne({ url, type: 'link' })
    .populate({ path: 'data', match: { communityId } });

  if (!post) {
    const parentObj = {
      image,
      title,
      description: linkObject.description,
      url,
      tags,
      postDate,
      payoutTime,
      hidden,
      type: 'link',
      latestComment: postDate
    };
    post = await new (this.model('Post'))(parentObj);
  }

  const eligibleForReward = !post.parentPost && !post.twitter;

  if (!post.data) {
    post = await post.addPostData(postObject);
  } else if (!post.data.eligibleForReward && eligibleForReward) {
    post.data.eligibleForReward = eligibleForReward;
    post.data.postDate = postDate;
    post.data.payoutTime = payoutTime;
  }

  const combinedTags = [...new Set([...(post.tags || []), ...(tags || [])])];
  post.tags = combinedTags;
  post.data.tags = combinedTags;
  linkObject.tags = combinedTags;

  // TODO figure out what to do with payoutTime should old post reset?
  // for now we don't update payout time
  if (!hidden && post.latestComment < postDate) {
    post.latestComment = postDate;
    post.data.latestComment = postDate;
  }

  if (!hidden) await post.updateRank({ communityId });

  post = await post.upsertMetaPost(post.metaPost, linkObject);
  post.data = await post.data.save();
  post = await post.save();

  return post;
};

PostSchema.methods.upsertLinkParent = async function upsertLinkParent(linkObject) {
  const post = this;

  const parent = await this.model('Post').newLinkPost({ postObject: post, linkObject });
  parent.commentCount++;

  post.linkParent = parent;
  post.parentPost = parent;
  if (post.data) post.data.parentPost = parent;
  post.metaPost = parent.metaPost;

  return post;
};

PostSchema.methods.insertIntoFeed = async function insertIntoFeed(
  communityId,
  community
) {
  try {
    const post = this;
    if (post.parentPost) throw new Error("Child comments don't go in the feed");

    post.data = await this.model('PostData').findOneAndUpdate(
      { post: post._id, communityId },
      { isInFeed: true },
      { new: true }
    );

    // this.model('CommunityFeed').addToFeed(post, post.data.community);

    const newPostEvent = {
      type: 'SET_NEW_POSTS_STATUS',
      payload: { communityId, community }
    };
    socketEvent.emit('socketEvent', newPostEvent);
    return post;
  } catch (err) {
    return console.log('insertIntoFeed error', err); // eslint-disable-line
  }
};

PostSchema.methods.upsertMetaPost = async function upsertMetaPost(metaId, linkObject) {
  try {
    const MetaPost = this.model('MetaPost');
    let meta;
    if (metaId) {
      const _id = metaId._id || metaId;
      if (_id) meta = await MetaPost.findOne({ _id });
    }
    const url = linkObject ? linkObject.url : this.url || this.link;
    if (url && !meta) meta = await MetaPost.findOne({ url });

    if (!meta) meta = new MetaPost(linkObject);
    else meta.set(linkObject);
    meta = await meta.save();

    this.metaPost = meta;
    return this.save();
  } catch (err) {
    console.log('upsertMetaPost error', err); // eslint-disable-line
    return this;
  }
};

// PostSchema.statics.sendOutInvestInfo = async function sendOutInvestInfo(postIds, userId) {
//   try {
//     const investments = await this.model('Invest').find({
//       investor: userId,
//       post: { $in: postIds }
//     });
//     const updatePosts = {
//       _id: userId,
//       type: 'UPDATE_POST_INVESTMENTS',
//       payload: investments
//     };
//     socketEvent.emit('socketEvent', updatePosts);
//   } catch (err) {
//     console.log('sendOutInvestInfo error', err); // eslint-disable-line
//   }
// };

async function getPostData({ post, communityId }) {
  if (!post.data) {
    post.data = await this.model('PostData').findOne({ post: post._id, communityId });
  }
  return post;
}

PostSchema.methods.addTags = async function addTags({ tags, communityId }) {
  try {
    let post = this;
    post = await getPostData({ post, communityId });

    const combinedTags = [...new Set([...(post.tags || []), ...(tags || [])])];
    post.tags = combinedTags;
    post.data.tags = combinedTags;
    await post.data.save();
    // linkObject.tags = combinedTags;
    return post.save();
  } catch (err) {
    return console.log('error adding tags', err); // eslint-disable-line
  }
};

PostSchema.statics.sendOutMentions = async function sendOutMentions(
  mentions,
  post,
  mUser,
  comment
) {
  try {
    let textParent = comment || post;
    const promises = mentions.map(async mention => {
      const type = comment ? 'comment' : 'post';

      mUser = await this.model('User').findOne(
        { _id: mUser._id || mUser },
        'blockedBy blocked name role'
      );

      const blocked =
        mUser.blockedBy.find(u => u === mention) ||
        mUser.blocked.find(u => u === mention);

      if (blocked) textParent.mentions = textParent.mentions.filter(m => m !== blocked);

      let query = { handle: mention };

      let group;
      if (mention === 'everyone') {
        if (mUser.role !== 'admin') return null;
        query = {}; // TODO should this this as community
        group = ['everyone'];
        createMentionNotification({
          post,
          user: { _id: null },
          mUser,
          type,
          Notification: this.model('Notification'),
          group,
          mention
        });
      }

      const users = await this.model('User').find(
        query,
        'deviceTokens email name notificationSettings'
      );

      users.forEach(async user => {
        const action = ' mentioned you in a ' + type;
        let alert = (mUser.name || mUser) + action;
        if (mention === 'everyone' && post.body) alert = post.body;
        // TODO batch notifications & emails

        const payload = {
          fromUser: mUser,
          toUser: user,
          post,
          action,
          noteType: 'mention'
        };

        sendNotification(user, alert, payload);

        if (mention === 'everyone') return;

        createMentionNotification({
          post,
          user,
          mUser,
          type,
          Notification: this.model('Notification'),
          group,
          mention
        });
      });
      return null;
    });

    await Promise.all(promises);
    textParent = await textParent.save();
    textParent.updateClient();
    return textParent;
  } catch (err) {
    return console.log('sendOutMentions error', err); // eslint-disable-line
  }
};

async function createMentionNotification({
  post,
  user,
  mUser,
  type,
  Notification,
  group,
  mention
}) {
  const dbNotificationObj = {
    post: post._id,
    forUser: user._id,
    group,
    byUser: mUser._id || mUser,
    amount: null,
    type: type + 'Mention',
    personal: true,
    read: false
  };

  const newDbNotification = new Notification(dbNotificationObj);
  const note = await newDbNotification.save();

  const newNotifObj = {
    _id: group ? null : mention,
    type: 'ADD_ACTIVITY',
    payload: note
  };

  socketEvent.emit('socketEvent', newNotifObj);
}

// pruneFeed (only for link posts)
PostSchema.methods.pruneFeed = async function pruneFeed({ communityId }) {
  const post = this;

  if (!post.data) {
    post.data = await this.model('PostData').findOne({ post: post._id, communityId });
  }
  const { shares } = post.data;

  if (post.type !== 'link') throw new Error('Should not prune anything but links');
  if (!communityId) throw new Error('missing community');

  // Thread has no children - remove everything
  const children = await this.model('Post').countDocuments({ parentPost: post._id });

  // there is no way to remove post link
  // maybe we shouldn't 'invest in links automatically'?
  if (!children && !shares) {
    await post.remove();
    return null;
  }

  const communityChildren = await this.model('Post').countDocuments({
    communityId,
    parentPost: post._id
  });

  if (communityChildren || shares) return post;

  await this.model('PostData')
    .deleteOne({ post: post._id, communityId })
    .exec();

  return post;
};

async function updateParentPostOnRemovingChild(post) {
  const { communityId } = post;

  if (!communityId) {
    throw new Error('error missing post community id!', post.toObject());
  }
  let parent = await post
    .model('Post')
    .findOne({ _id: post.linkParent })
    .populate({ path: 'data', match: { communityId } });

  if (parent) parent = await parent.pruneFeed({ communityId });

  if (!parent) return null;
  if (post.hidden) return parent;

  // parent.data = await post.model('PostData').findOne({ post: parent._id, communityId });
  if (!post.data) {
    post.data = await post.model('PostData').findOne({ post: post._id, communityId });
  }

  if (!post.data || !parent.data) throw new Error('missing post data');

  // TODO maybe always update the time?
  const shouldUpdateTime = post.postDate === parent.data.latestComment;
  const shouldUpdateRank = post.data.rank >= parent.data.rank;

  if (shouldUpdateRank || shouldUpdateTime) {
    parent = await parent.updateRank({ communityId, shouldUpdateTime });
  }
  return parent;
}

// TODO we should replace post with a dummy post if post has
// comments or replies so we can preserver
PostSchema.post('remove', async function postRemove(post, next) {
  if (post.linkParent && post.type !== 'comment') {
    await updateParentPostOnRemovingChild(post);
  }

  // await this.model('CommunityFeed').removeFromAllFeeds(doc);
  const note = this.model('Notification')
    .deleteMany({ post: post._id })
    .exec();
  const feed = this.model('Feed')
    .deleteMany({ post: post._id })
    .exec();
  const data = this.model('PostData')
    .deleteMany({ post: post._id })
    .exec();

  let metaPost;
  // if (post.type === 'link' && !post.parentParent) {
  //   metaPost = await this.model('MetaPost')
  //   .deleteMany({ post: post._id })
  //   .exec();
  // }

  let commentNote;
  // remove notifications
  if (post.type === 'comment' || post.type === 'repost') {
    commentNote = this.model('Notification')
      .deleteMany({ comment: post._id })
      .exec();
  }

  await Promise.all([note, feed, data, metaPost, commentNote]);
  return next();
});

PostSchema.methods.incrementUnread = async function incrementUnread({
  communityId,
  community
}) {
  await this.model('CommunityMember').updateMany(
    { communityId },
    { $inc: { unread: 1 } }
  );
  pubsub.publish(UPDATE_UNREAD, { community, communityId: communityId.toString() });
};

module.exports = mongoose.model('Post', PostSchema);
