import { EventEmitter } from 'events';

import MetaPost from '../links/link.model';
import User from '../user/user.model';
import Notification from '../notification/notification.model';
import Invest from '../invest/invest.model';


let apnData = require('../../pushNotifications');
let mongoose = require('mongoose');
// var mongoose = require('mongoose-fill')

let PostSchemaEvents = new EventEmitter();
let Schema = mongoose.Schema;

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

let PostSchema = new Schema({
  body: String,
  title: String,
  community: String,
  communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
  tags: [{ type: String, ref: 'Tag' }],
  category: { type: String, ref: 'Tag' },
  repost: {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    commentBody: String
  },
  user: { type: String, ref: 'User', index: true },
  embeddedUser: {
    handle: String,
    _id: String,
    // id: String,
    name: String,
    image: String,
  },

  flagged: { type: Boolean, default: false },
  flaggedBy: [{ type: String, ref: 'User', select: false }],
  flaggedTime: Date,
  mentions: [{ type: String, ref: 'User' }],

  // store link info here
  metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
  url: { type: String, unique: false },

  // TEMP Deprecate remove after migrate 0.20
  link: { type: String, unique: false },

  // Should be array of links used instead of metaPost
  // TODO: Implement this
  links: [{
    text: String,
    href: String,
    position: Number,
    metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' }
  }],

  aboutLink: { type: Schema.Types.ObjectId, ref: 'Post' },
  linkParent: { type: Schema.Types.ObjectId, ref: 'Post' },
  parentPost: { type: Schema.Types.ObjectId, ref: 'Post' },
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

  // payout: { type: Number, default: 0 },
  // payOutShare: { type: Number, default: 0 },

  // TODO - separate table per community!
  // shares: { type: Number, default: 0 },
  // balance: { type: Number, default: 0 },

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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

PostSchema.virtual('reposted', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'repost.post'
});

PostSchema.virtual('commentary', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'linkParent'
});


PostSchema.virtual('embeddedUser.relevance', {
  ref: 'Relevance',
  localField: 'user',
  foreignField: 'user',
  justOne: true,
});

PostSchema.virtual('data', {
  ref: 'PostData',
  localField: '_id',
  foreignField: 'post',
  justOne: true,
});

PostSchema.index({ twitter: 1 });
PostSchema.index({ twitter: 1, twitterId: 1 });

PostSchema.index({ rank: 1 });
PostSchema.index({ postDate: 1 });
PostSchema.index({ _id: 1, user: 1 });
PostSchema.index({ postDate: 1, tags: 1 });
PostSchema.index({ rank: 1, tags: 1 });
PostSchema.index({ paidOut: 1, payoutTime: 1 });

// PostSchema.index({ title: 'text', body: 'text' });

PostSchema.pre('save', async function save(next) {
  try {
    // TODO do we need this? don't thinks so...
    // await this.updateRank();
    let countQuery = { parentPost: this._id };
    if (this.type === 'link') {
      countQuery = { aboutLink: this._id };
    }
    this.commentCount = await this.model('Post').count(countQuery);
    // if (!this.latestComment) this.latestComment = this.postDate;
  } catch (err) {
    console.log(err);
    return next();
  }
  return next();
});


PostSchema.methods.addPostData = async function addPostData(community) {
  let eligibleForReward = this.type === 'comment' || this.type === 'post' || this.type === 'repost';
  eligibleForReward = !this.twitter && eligibleForReward;
  let data = new (this.model('PostData'))({
    eligibleForReward,
    postDate: this.postDate || this.createdAt,
    payoutTime: this.payoutTime,
    post: this._id,
    community: community ? community.slug : this.community,
    communityId: community ? community._id : this.communityId,
    relevance: this.relevance,
    rank: this.rank,
    relevanceNeg: this.relevanceNeg,
    latestComment: this.latestComment || this.postDate,
  });
  await data.save();
  this.data = data;
  return this;
};

// Update parent feed status (only for link posts)
PostSchema.statics.updateFeedStatus = async function updateFeedStatus(postId, community, remove) {
  try {
    let linkPost = await this.model('Post').findOne({ _id: postId })
    .populate({
      path: 'commentary',
      sort: { postDate: -1 }
    });

    if (!linkPost) return;
    let count = linkPost.commentary.length;

    if (!count && linkPost) {
      await this.model('CommunityFeed').removeFromAllFeeds(linkPost);
      await this.model('MetaPost').remove({ _id: linkPost.metaPost }).exec();
    }

    let communityPosts = linkPost.commentary.filter(c => c.community === community);
    // console.log('found ', communityPosts.length + ' community posts');
    if (!communityPosts.length) {
      await this.model('CommunityFeed').removeFromCommunityFeed(linkPost, community);
      // remove empty link posts
      await linkPost.remove();
    } else if (!remove) {
      // TODO this is messy
      // Update the date of post in feed
      let newFeedItem = await this.model('CommunityFeed').findOneAndUpdate(
        { community, post: linkPost._id },
        { latestPost: communityPosts[0].postDate },
        { new: true }
      );
      // TODO can maybe make this more efficient?
      await linkPost.updateRank(community);
    }
  } catch (err) {
    console.log(err);
  }
};

PostSchema.post('remove', async function postRemove(doc) {
  try {
    if (doc.linkParent) {
      await this.model('Post').updateFeedStatus(doc.linkParent, this.community, true);
    }
    await this.model('CommunityFeed').removeFromAllFeeds(doc);

    let note = this.model('Notification').remove({ post: this._id });
    let feed = await this.model('Feed').remove({ post: this._id });
    let twitterFeed = await this.model('TwitterFeed').remove({ post: this._id });

    // TODO we should replace post with a dummy post on delete
    // should we remove post comment also!?!
    // probably not...
    // let comment = this.model('Post').remove({ post: this._id });

    await this.model('PostData').remove({ post: doc._id });

    // should invest info be removed?
    // probably not - a chance to erase rep...
    // await this.model('Invest').remove({ post: doc._id });

    // remove notifications
    if (this.type === 'comment' || this.type === 'repost') {
      await this.model('Notification').remove({ comment: this._id });
    }

    // TODO better tag management and per community
    if (!this.twitter) {
      this.tags.forEach((tag) => {
        this.model('Tag').findOne({ _id: tag }, (err, foundTag) => {
          if (!foundTag) return;
          if (foundTag.count > 1) {
            foundTag.count--;
            foundTag.save(error => {
              if (error) console.log('saving tag error');
            });
          } else {
            foundTag.remove();
          }
        });
      });
    }

    // this makes it faster (don't need all awaits)?
    let promises = [note, feed, twitterFeed];
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
  }
});

PostSchema.statics.events = PostSchemaEvents;

PostSchema.methods.updateClient = function updateClient(user) {
  if (this.user && this.user._id) this.user = this.user._id;
  let postNote = {
    _id: user ? user._id : null,
    type: 'UPDATE_POST',
    payload: this,
  };
  this.model('Post').events.emit('postEvent', postNote);
};

PostSchema.methods.addUserInfo = async function addUserInfo(user) {
  try {
    this.embeddedUser = {
      id: user._id,
      _id: user._id,
      handle: user.handle,
      name: user.name,
      image: user.image,
    };

    return this;
  } catch (err) {
    console.log('error adding embedded user', err);
    return this;
  }
};

// TODO work on this
PostSchema.methods.updateRank = async function updateRank(community, dontInsert) {
  try {
    if (!this.data) {
      this.data = await this.model('PostData').find({ post: this._id, community });
    }

    let sign = 1;
    if (this.data.pagerank < 0) {
      sign = -1;
    }
    if (!this.data.pagerank) this.data.pagerank = 0;
    let rank = Math.abs(this.data.pagerank);

    let newRank = (this.data.postDate.getTime() / TENTH_LIFE) + (sign * Math.log10(rank + 1));
    rank = Math.round(newRank * 1000) / 1000;

    // also get max rank of children
    // This will not return top comment because rank is inside data
    let topComment = await this.model('Post').findOne({ parentPost: this._id, community }, 'rank')
    .sort({ rank: -1 })
    .populate({ path: 'data', match: { community } });

    if (topComment) {
      // TODO remove this (only for migration)
      let commentRank = topComment.data ? topComment.data.rank : 0;
      rank = Math.max(rank, commentRank);
    }

    // THIS will update the rank in the feed
    if (community && !this.parentPost && !dontInsert) {
      console.log('updating post rank ', rank);
      await this.model('CommunityFeed').updateRank(this, community, rank);
    }

    this.data.rank = rank;
    this.rank = rank;
    if (this.community === community) {
      this.pagerank = this.data.pagerank;
    }
    await this.data.save();
    await this.save();
    return this;
  } catch (err) {
    console.log('error updating post rank ', err);
  }
};

PostSchema.methods.upsertLinkParent = async function upsertLinkParent(linkObject) {
  try {
    if (!linkObject.url) return console.log('missing url ', linkObject);
    let { tags, postDate, payoutTime } = this;
    let parentObj = {
      url: linkObject.url,
      // top level comments only
      tags,
      postDate,
      latestComment: postDate,
      payoutTime,
      type: 'link'
    };

    let parent = await this.model('Post').findOne({ url: linkObject.url, type: 'link' })
    .populate({ path: 'data', match: { community: this.community } });

    // -------- BRAND NEW LINK --------
    if (!parent) {
      parent = await new (this.model('Post'))(parentObj);
      // let data = new (this.model('PostData'))(postData);
    }

    if (!parent.data) {
      parent = await parent.addPostData({ slug: this.community, _id: this.communityId });
    }

    // console.log('parent ', parent);
    if (parent.latestComment < postDate) {
      parent.latestComment = postDate;
      parent.data.latestComment = postDate;
      console.log('updated data latestComment ', parent.data.latestComment);
      // await this.model('CommunityFeed').updateDate(parent._id, this.community, postDate);
    }


    // TODO figure out what to do with payoutTime should old post reset?
    // for now we don't update payout time


    if (this.twitter) {
      parent.twitterScore = Math.max(parent.twitterScore, this.twitterScore);
      parent.seenInFeedNumber += 1;
    }

    // USED FOR TWITTER
    if (!this.hidden) {
      // this also inserts a posts into the community feed
      await parent.updateRank(this.community);
    }

    // write link metadata
    parent = await parent.upsertMetaPost(this.metaPost, linkObject);

    parent.data = await parent.data.save();
    parent = await parent.save();

    this.linkParent = parent;
    this.parentPost = parent;
    this.aboutLink = parent;

    this.metaPost = parent.metaPost;
    await this.save();

    return this;
  } catch (err) {
    console.log('error upserting parent ', err);
  }
};

PostSchema.methods.insertIntoFeed = async function insertIntoFeed(community) {
  try {
    if (!this.data) this.data = await this.model('PostData').find({ post: this._id, community });
    let feedItem = await this.model('CommunityFeed').findOneAndUpdate(
      { community, post: this._id },
      {
        latestPost: this.data.latestComment || this.data.postDate,
        tags: this.tags,
        // categories: this.categories,
        // keywords: meta.keywords,
        rank: this.data.rank,
      },
      { upsert: true, new: true }
    );
    console.log('inserted feed item ', feedItem);
    // notify front end there is a new post
    let newPostEvent = {
      type: 'SET_NEW_POSTS_STATUS',
      payload: { community },
    };
    this.model('Post').events.emit('postEvent', newPostEvent);
  } catch (err) {
    console.log(err);
  }
};


PostSchema.methods.upsertMetaPost = async function upsertMetaPost(metaId, linkObject) {
  let meta;
  try {
    if (metaId) meta = await MetaPost.findOne({ _id: metaId });
    let url = linkObject.url || this.url || this.link;
    if (url && !meta) {
      meta = await MetaPost.findOne({ url });
    }
    if (meta) {
      meta.set(linkObject);
      meta = await meta.save();
    } else {
      meta = {
        ...linkObject,
        tags: this.tags,
      };
      meta = new MetaPost(meta);
      meta = await meta.save();
    }
    this.metaPost = meta._id;
    return this;
  } catch (err) {
    console.log('error creating / updating link ', err);
  }
  return meta;
};

PostSchema.statics.sendOutInvestInfo = async function sendOutInvestInfo(postIds, userId) {
  try {
    let investments = await Invest.find(
      { investor: userId, post: { $in: postIds } }
    );

    let updatePosts = {
      _id: userId,
      type: 'UPDATE_POST_INVESTMENTS',
      payload: investments
    };
    this.events.emit('postEvent', updatePosts);
  } catch (err) {
    console.log(err);
  }
};

PostSchema.statics.sendOutMentions = async function sendOutMentions(mentions, post, mUser, comment) {
  let textParent = comment || post;
  try {
    let promises = mentions.map(async mention => {
      try {
        let blocked;
        let type = comment ? 'comment' : 'post';

        mUser = await User.findOne({ _id: mUser._id || mUser }, 'blockedBy blocked name role');
        blocked = mUser.blockedBy.find(u => u === mention) || mUser.blocked.find(u => u === mention);
        if (blocked) {
          textParent.mentions = textParent.mentions.filter(m => m !== blocked);
        }

        let query = { _id: mention };
        if (mention === 'everyone') {
          query = {};
          if (mUser.role !== 'admin') return null;
        }

        User.find(query, 'deviceTokens')
        .then((users) => {
          users.forEach(user => {
            let alert = (mUser.name || mUser) + ' mentioned you in a ' + type;
            if (mention === 'everyone' && post.body) alert = post.body;
            let payload = { 'Mention from': textParent.embeddedUser.name };
            apnData.sendNotification(user, alert, payload);
          });
        });

        // if (mention === 'everyone') return null;

        let dbNotificationObj = {
          post: post._id,
          forUser: mention,
          byUser: mUser._id || mUser,
          amount: null,
          type: type + 'Mention',
          personal: true,
          read: false
        };

        let newDbNotification = new Notification(dbNotificationObj);
        let note = await newDbNotification.save();

        let newNotifObj = {
          _id: mention === 'everyone' ? null : mention,
          type: 'ADD_ACTIVITY',
          payload: note
        };

        console.log('send out push notification');

        this.events.emit('postEvent', newNotifObj);
      } catch (err) {
        console.log('mentions error ', err);
      }
    });

    await Promise.all(promises);

    textParent = await textParent.save();
    console.log('after mention check ', textParent.mentions);
    textParent.updateClient();
  } catch (err) {
    console.log('error updating post after sending mentions ', err);
  }

  return textParent;
};

module.exports = mongoose.model('Post', PostSchema);
