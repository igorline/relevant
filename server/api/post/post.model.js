import { EventEmitter } from 'events';

import MetaPost from '../metaPost/metaPost.model';
import User from '../user/user.model';
import Notification from '../notification/notification.model';
import Invest from '../invest/invest.model';

let apnData = require('../../pushNotifications');
let mongoose = require('mongoose');

let PostSchemaEvents = new EventEmitter();
let Schema = mongoose.Schema;

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;

let PostSchema = new Schema({
  title: { type: String, default: '' },
  description: String,
  image: String,
  link: String,
  tags: [{ type: String, ref: 'Tag' }],
  body: String,
  domain: String,

  shortText: { type: String },
  longText: { type: String },
  articleDate: Date,
  articleAuthor: [String],
  copyright: String,
  links: [{
    text: String,
    href: String,
  }],
  publisher: String,

  repost: {
    post: { type: String, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    commentBody: String
  },
  value: { type: Number, default: 0 },
  category: { type: String, ref: 'Tag' },
  user: { type: String, ref: 'User', index: true },
  embeddedUser: {
    id: String,
    name: String,
    image: String,
  },

  flagged: { type: Boolean, default: false },
  flaggedBy: [{ type: String, ref: 'User', select: false }],
  flaggedTime: Date,

  mentions: [{ type: String, ref: 'User' }],
  // investments: [{ type: Schema.Types.ObjectId, ref: 'Invest' }],
  // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  rank: { type: Number, default: 0 },
  lastPost: [{ type: String, ref: 'User' }],
  categoryName: String,
  categoryEmoji: String,
  metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
  postDate: { type: Date, index: true, default: new Date() },
  relevance: { type: Number, default: 0 },
  relevanceNeg: { type: Number, default: 0 },
  rankRelevance: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },
  keywords: [String],

  paidOut: { type: Boolean, default: false },
  payoutTime: { type: Date },
  payout: { type: Number, default: 0 },
  payOutShare: { type: Number, default: 0 },

  balance: { type: Number, default: 0 },

  twitter: { type: Boolean, default: false },
  twitterUser: Number,
  twitterId: Number,
  twitterScore: Number,
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

PostSchema.virtual('reposted', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'repost.post'
});

PostSchema.index({ rank: 1 });
PostSchema.index({ postDate: 1 });
PostSchema.index({ _id: 1, user: 1 });
PostSchema.index({ postDate: 1, tags: 1 });
PostSchema.index({ rank: 1, tags: 1 });
PostSchema.index({ paidOut: 1, payoutTime: 1 });

// PostSchema.createIndex({"subject":"text","content":"text"})
// PostSchema.index({ title: 'text', body: 'text' });

PostSchema.pre('save', async function (next) {
  try {
    let sign = 1;
    if (this.rankRelevance < 0) {
      sign = -1;
    }
    if (!this.rankRelevance) this.rankRelevance = 0;
    let rank = Math.abs(this.rankRelevance);
    let newRank = (this.postDate.getTime() / TENTH_LIFE) + (sign * Math.log10(rank + 1));

    this.rank = Math.round(newRank * 1000) / 1000;

    this.commentCount = await this.model('Comment').count({ post: this._id });
  } catch (err) {
    console.log(err);
    return next();
  }
  return next();
});


PostSchema.pre('remove', async function (next) {
  try {
    let repost = this.repost || false;
    console.log('removing repost', repost);
    let note = this.model('Notification').remove({ post: this._id });
    // keep these but update with 'removed post flag?'
    // this.model('Invest').remove({ post: this._id }, next);
    // this.model('Earnings').remove({ post: this._id }, next);

    let feed = this.model('Feed').remove({ post: this._id });
    let comment = this.model('Comment').remove({ post: this._id });
    let meta = this.model('MetaPost').findOneAndUpdate(
      { _id: this.metaPost },
      { $pull: { commentary: this._id }, $inc: { commentaryCount: -1 } },
      { multi: true, new: true }, (err, metaPost) => {
        if (metaPost && metaPost.commentaryCount <= 0) {
          metaPost.remove();
        }
      }
    );

    // let post = this.model('Post').remove({ 'repost.post': this._id });
    // let user = this.model('User').update(
    //     { _id: this.user },
    //     { $inc: { postCount: -1 } },
    //     { multi: true },
    //     next
    // );

    this.tags.forEach((tag) => {
      console.log(tag, 'tag');
      this.model('Tag').findOne({ _id: tag }, (err, foundTag) => {
        if (!foundTag) return next();
        console.log('foundTag ', foundTag._id);
        if (foundTag.count > 1) {
          foundTag.count--;
          console.log('changing tag count for ', foundTag._id);
          foundTag.save((err) => {
            if (err) console.log('saving tag error');
          });
        } else {
          console.log('removing tag ', foundTag.name);
          foundTag.remove();
        }
      });
    });

    let promises = [note, feed, comment, meta];
    let finished = await Promise.all(promises);
    // console.log(finished);
  } catch (err) {
    console.log('error deleting post references ', err);
  }
  next();
});

PostSchema.statics.events = PostSchemaEvents;

PostSchema.methods.updateClient = function (user) {
  if (this.user && this.user._id) this.user = this.user._id;
  let postNote = {
    _id: user ? user._id : null,
    type: 'UPDATE_POST',
    payload: this,
  };
  this.model('Post').events.emit('postEvent', postNote);
};

PostSchema.methods.upsertMetaPost = async function (metaId) {
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
      // only do this when we create new post!
      if (!meta.tags) meta.tags = [];
      let tags = [...meta.tags, ...this.tags];
      tags = [...new Set(tags)];
      meta.tags = tags;

      if (!meta.categories) meta.categories = [];
      let cats = [...meta.categories, this.category];
      cats = [...new Set(cats)];
      meta.categories = cats;

      meta.keywords = [...new Set([...meta.keywords, ...this.keywords || []])];
      meta.articleAuthor = this.articleAuthor;

      if (!this.twitter) {
        meta.commentaryCount++;
        meta.newCommentary = this._id;
        meta.commentary.push(this);
        meta.latestPost = this.postDate;
        meta.twitter = false;
        // meta.url = this.post.link;
      } else {
        meta.latestTweet = this.postDate;
        meta.tweetCount++;
        meta.commentary.push(this);
        // meta.twitterCommentary.push(this);
        meta.seenInFeedNumber++;
        meta.twitterScore = Math.max(meta.twitterScore, this.twitterScore);
      }

      if (this.image) {
        meta.image = this.image;
      }
      meta = await meta.save();
    } else {
      meta = {
        url: this.link,
        rank: this.rank,
        newCommentary: this._id,
        topCommentary: this._id,
        latestPost: this.postDate,
        commentaryCount: 1,
        tags: this.tags,
        categories: [this.category],
        // may not need to do this if meta is pre-populated
        articleAuthor: this.articleAuthor,
        shortText: this.shortText,
        domain: this.domain,
        commentary: [this._id],

        // commentary: this.twitter ? null : [this._id],
        title: this.title,
        description: this.description,
        image: this.image,
        keywords: this.keywords,
      };
      if (this.twitter) {
        meta = {
          ...meta,
          tweetCount: 1,
          seenInFeedNumber: 1,
          // twitterCommentary: [this._id],
          latestTweet: this.postDate,
          twitterScore: this.twitterScore,
          twitter: true,
        };
      }
      let metaPost = new MetaPost(meta);
      // console.log(meta);
      meta = await metaPost.save();
      this.metaPost = metaPost._id;
      console.log('meta tags', meta.tags);
    }
  } catch (err) {
    console.log('error creating / updating metapost');
  }
  return meta;
};

PostSchema.statics.sendOutInvestInfo = async function (postIds, userId) {
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

PostSchema.statics.sendOutMentions = async function(mentions, post, mUser, comment) {
  let textParent = comment || post;
  try {
    let promises = mentions.map(async mention => {
      try {
        let blocked;
        let type = comment ? 'comment' : 'post';

        mUser = await User.findOne({ _id: mUser._id || mUser }, 'blockedBy blocked name role');
        blocked = mUser.blockedBy.find(u => u === mention) || mUser.blocked.find(u => u === mention);
        if (blocked) {
          console.log('user blocked, removing mention ', blocked);
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
