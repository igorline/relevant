import { EventEmitter } from 'events';

import MetaPost from '../metaPost/metaPost.model';
import User from '../user/user.model';
import Notification from '../notification/notification.model';
import Invest from '../invest/invest.model';
import Comment from '../comment/comment.model';
import CommunityFeed from '../communityFeed/communityFeed.model';


let apnData = require('../../pushNotifications');
let mongoose = require('mongoose');
// var mongoose = require('mongoose-fill')

let PostSchemaEvents = new EventEmitter();
let Schema = mongoose.Schema;

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

let PostSchema = new Schema({
  // title: { type: String, default: '' },
  // description: String,
  // image: String,
  // link: String,
  // domain: String,
  // shortText: { type: String },
  // longText: { type: String },
  // articleDate: Date,
  // articleAuthor: [String],
  // copyright: String,
  // publisher: String,
  // keywords: [String],

  body: String,

  community: String,
  tags: [{ type: String, ref: 'Tag' }],
  category: { type: String, ref: 'Tag' },

  repost: {
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    commentBody: String
  },

  // value: { type: Number, default: 0 },
  // category: { type: String, ref: 'Tag' },
  user: { type: String, ref: 'User', index: true },
  embeddedUser: {
    handle: String,
    id: String,
    name: String,
    image: String,
    relevance: { type: Schema.Types.ObjectId, ref: 'Relevance' },
  },

  flagged: { type: Boolean, default: false },
  flaggedBy: [{ type: String, ref: 'User', select: false }],
  flaggedTime: Date,

  mentions: [{ type: String, ref: 'User' }],

  // what is this?
  // lastPost: [{ type: String, ref: 'User' }],

  // deprecated
  // categoryName: String,
  // categoryEmoji: String,


  // store metadata here only
  metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },

  // Should be array of links used instead of metaPost
  // not implemented yet
  links: [{
    text: String,
    href: String,
    position: Number,
    metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' }
  }],

  parentPost: { type: Schema.Types.ObjectId, ref: 'Post' },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Post' },

  postDate: { type: Date, index: true, default: new Date() },

  // separate table for community
  // relevanceNeg: { type: Number, default: 0 },

  rank: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },

  commentCount: { type: Number, default: 0 },
  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },

  // todo should be diff table - diff communities will have diff payouts
  paidOut: { type: Boolean, default: false },
  payoutTime: { type: Date },
  payout: { type: Number, default: 0 },
  payOutShare: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  // Twitter stuff - do we need this?
  twitter: { type: Boolean, default: false },
  twitterUser: Number,
  twitterId: Number,
  twitterScore: Number,
  feedRelevance: Number,
  twitterUrl: String,
  isRepost: { type: Boolean, default: false },
  isComment: { type: Boolean, default: false },

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
// PostSchema.virtual('posts', {
//   ref: 'BlogPost',
//   localField: '_id',
//   foreignField: 'author'
// });
// PostSchema.virtual('embeddedUser.reputation')
// .get(async function() {
//   let community = this.community || 'relevant';
//   let reputationRecord = await this.model('Relevance').findOne({ community, user: this.user, global: true });
//   console.log(reputationRecord);
//   return reputationRecord ? reputationRecord.relevance : 0;
// });

// PostSchema.fill('embeddedUser.reputation', async function(callback){
//   let community = this.community || 'relevant';
//   let reputationRecord = await this.model('Relevance').findOne({ community, user: this.user, global: true });
//   console.log(reputationRecord);
//   return callback(null, reputationRecord ? reputationRecord.relevance : 0);
// });

PostSchema.index({ twitter: 1 });
PostSchema.index({ twitter: 1, twitterId: 1 });

PostSchema.index({ rank: 1 });
PostSchema.index({ postDate: 1 });
PostSchema.index({ _id: 1, user: 1 });
PostSchema.index({ postDate: 1, tags: 1 });
PostSchema.index({ rank: 1, tags: 1 });
PostSchema.index({ paidOut: 1, payoutTime: 1 });

// PostSchema.createIndex({"subject":"text","content":"text"})
// PostSchema.index({ title: 'text', body: 'text' });

PostSchema.pre('save', async function save(next) {
  try {

    // rank should be computed for community...
    // TODO USE postData
    let sign = 1;
    if (this.relevance < 0) {
      sign = -1;
    }
    if (!this.relevance) this.relevance = 0;
    let rank = Math.abs(this.relevance);
    let newRank = (this.postDate.getTime() / TENTH_LIFE) + (sign * Math.log10(rank + 1));
    this.rank = Math.round(newRank * 1000) / 1000;

    this.commentCount = await this.model('Post').count({ parentPost: this._id });
  } catch (err) {
    console.log(err);
    return next();
  }
  return next();
});


PostSchema.pre('remove', async function remove(next) {
  try {
    let note = this.model('Notification').remove({ post: this._id });

    let feed = await this.model('Feed').remove({ post: this._id });
    let twitterFeed = await this.model('TwitterFeed').remove({ post: this._id });

    let comment = this.model('Comment').remove({ post: this._id });

    let meta = await this.model('MetaPost').findOneAndUpdate(
      { _id: this.metaPost },
      { $pull: { commentary: this._id }, $inc: { commentaryCount: -1 } },
      { multi: true, new: true }
    );

    if (meta && meta.commentary.length === 0) {
      await meta.remove();
      meta = null;
    }

    // problem: if meta includes post from a diff community it wont be removed;
    if (meta) {
      meta.pruneCommunityFeed(this.community);
    }

    if (!this.twitter) {
      this.tags.forEach((tag) => {
        this.model('Tag').findOne({ _id: tag }, (err, foundTag) => {
          if (!foundTag) return next();
          if (foundTag.count > 1) {
            foundTag.count--;
            foundTag.save(err => {
              if (err) console.log('saving tag error');
            });
          } else {
            foundTag.remove();
          }
        });
      });
    }

    let promises = [note, feed, comment, meta, twitterFeed];
    await Promise.all(promises);
    next();
  } catch (err) {
    console.log('error deleting post references ', err);
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
    let relevance = await this.model('Relevance').findOneAndUpdate({
      user: user._id,
      // TODO update to use id
      community: this.community,
      global: true
    }, {}, { new: true, upsert: true });

    this.embeddedUser = {
      id: user._id,
      handle: user.handle,
      name: user.name,
      image: user.image,
      relevance,
    };

    return this;
  } catch (err) {
    console.log('error adding embedded user', err);
    return this;
  }
};


PostSchema.methods.upsertMetaPost = async function upsertMetaPost(metaId, linkObject) {
  let meta;
  try {
    if (metaId) meta = await MetaPost.findOne({ _id: metaId });
    if (this.link && !meta) {
      meta = await MetaPost.findOne({ url: this.link });
    }
    if (meta) {
      if (meta.rank < this.rank) {
        meta.rank = this.rank;
        meta.topCommentary = this._id;
      }

      // replace below with:
      meta = { ...meta, ...linkObject };
      // only do this when we create new post!
      // if (!meta.tags) meta.tags = [];
      // let tags = [...meta.tags, ...this.tags];
      // tags = [...new Set(tags)];
      // meta.tags = tags;

      // if (!meta.categories) meta.categories = [];
      // let cats = [...meta.categories, this.category];
      // cats = [...new Set(cats)];
      // meta.categories = cats;

      // meta.keywords = [...new Set([...meta.keywords, ...this.keywords || []])];
      // meta.articleAuthor = this.articleAuthor;

      if (!this.twitter) {
        meta.commentaryCount++;
        meta.newCommentary = this._id;
        meta.commentary.push(this);
        meta.latestPost = this.postDate;
        meta.twitter = false;
        // meta.url = this.post.link;
      } else {
        // meta.latestPost = this.postDate;
        meta.latestTweet = this.postDate;
        meta.tweetCount++;
        meta.commentary.push(this);
        // meta.twitterCommentary.push(this);
        meta.seenInFeedNumber++;
        meta.twitterScore = Math.max(meta.twitterScore, this.twitterScore);
        meta.feedRelevance = Math.max(meta.feedRelevance, this.feedRelevance);
      }

      if (this.image) {
        meta.image = this.image;
      }
      meta = await meta.save();
    } else {
      meta = {
        ...linkObject,
        rank: this.rank,
        newCommentary: this._id,
        topCommentary: this._id,
        commentary: [this._id],

        latestPost: this.postDate,
        commentaryCount: 1,
        tags: this.tags,

        // deprecate
        // categories: [this.category],
      };
      if (this.twitter) {
        meta = {
          ...meta,
          tweetCount: 1,
          seenInFeedNumber: 1,
          // twitterCommentary: [this._id],
          latestTweet: this.postDate,
          twitterScore: this.twitterScore,
          feedRelevance: this.feedRelevance,
          twitter: true,
          twitterUrl: this.twitterUrl
        };
      }
      let metaPost = new MetaPost(meta);
      // console.log(meta);
      meta = await metaPost.save();

      this.metaPost = metaPost._id;
      // console.log('meta tags', meta.tags);
    }

    // don't add post to community feed from twitter
    if (this.twitter != true) {
      let community = this.community || 'relevant';

      let feedItem = await this.model('CommunityFeed').findOneAndUpdate(
        { community, metaPost: meta._id },
        {
          latestPost: this.postDate,
          tags: meta.tags,
          categories: meta.categories,
          keywords: meta.keywords,
          rank: meta.rank,
        },
        { upsert: true, new: true }
      );

      // notify front end there is a new post
      let newPostEvent = {
        type: 'SET_NEW_POSTS_STATUS',
        payload: { community },
      };
      this.model('Post').events.emit('postEvent', newPostEvent);
    }
  } catch (err) {
    console.log('error creating / updating metapost ', err);
  }
  return meta;
};

PostSchema.statics.sendOutInvestInfo = async function sendOutInvestInfo(postIds, userId) {
  try {
    let investments = await Invest.find(
      { investor: userId, post: { $in: postIds } }
    );
    let postInv = investments.map(inv => inv.post);

    // DEPRICATED (HANDLE OLDER CLIENTS WHILE THEY UPDATE)
    let updatePostsDep = {
      _id: userId,
      type: 'UPDATE_POSTS_INVEST',
      payload: postInv
    };
    this.events.emit('postEvent', updatePostsDep);

    // NEW
    let updatePosts = {
      _id: userId,
      type: 'UPDATE_POST_INVESTMENTS',
      payload: investments
    };
    this.events.emit('postEvent', updatePosts);

    // let earnings = await Earnings.find({
    //   user: userId, post: { $in: postIds }
    // });

    // let earningsEvent = {
    //   _id: userId,
    //   type: 'UPDATE_EARNINGS',
    //   payload: earnings
    // };
    // this.events.emit('postEvent', earningsEvent);
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
