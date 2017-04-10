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
  title: String,
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
    name: String,
    image: String,
  },
  flagged: { type: Boolean, default: false },
  flaggedBy: [{ type: String, ref: 'User' }],
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
  keywords: [String]
}, {
  timestamps: true,
});

PostSchema.index({ rank: 1 });
PostSchema.index({ createdAt: 1 });
PostSchema.index({ createdAt: 1, user: 1 });
PostSchema.index({ createdAt: 1, tags: 1 });
PostSchema.index({ rank: 1, tags: 1 });
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

    let meta = await MetaPost.findOne({ _id: this.metaPost });
    if (!meta) return next();
    if (meta.rank < this.rank) {
      meta.rank = this.rank;
      await meta.save();
    }
  } catch (err) {
    console.log(err);
    return next();
  }
  return next();
});


PostSchema.pre('remove', function (next) {
  const self = this;
  this.model('Notification').remove({ post: this._id }, next);

  // keep these but update with 'removed post flag?'
  // this.model('Invest').remove({ post: this._id }, next);
  // this.model('Earnings').remove({ post: this._id }, next);

  this.model('Feed').remove({ post: this._id }, next);
  this.model('Comment').remove({ post: this._id }, next);
  this.model('MetaPost').findOneAndUpdate(
    { _id: this.metaPost },
    { $pull: { commentary: this._id }, $inc: { commentaryCount: -1 } },
    { multi: true, new: true }, (err, metaPost) => {
      if (metaPost && metaPost.commentaryCount <= 0) metaPost.remove(next);
      else next();
    }
  );
  this.model('User').update(
      { _id: this.user },
      { $inc: { postCount: -1 } },
      { multi: true },
      next
  );
  this.tags.forEach((tag) => {
    console.log(tag, 'tag');
    self.model('Tag').findOne({ _id: tag }, (err, foundTag) => {
      console.log('foundTag ', foundTag.name);
      if (foundTag.count > 1) {
        foundTag.count--;
        console.log('chainging tag count for ', foundTag.name);
        foundTag.save((err) => {
          if (err) console.log('saving tag error');
        });
      } else {
        console.log('removing tag ', foundTag.name);
        foundTag.remove();
      }
      next();
    });
  });
});

PostSchema.statics.events = PostSchemaEvents;

PostSchema.methods.updateClient = function (user) {
  let postObj = this.toObject();
  delete postObj.user;
  let postNote = {
    _id: user ? user._id : null,
    type: 'UPDATE_POST',
    payload: postObj,
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
      if (!meta.tags) meta.cats = [];
      let tags = [...meta.tags, ...this.tags];
      tags = [...new Set(tags)];
      meta.tags = tags;

      if (!meta.categories) meta.categories = [];
      let cats = [...meta.categories, this.category];
      cats = [...new Set(cats)];
      meta.categories = cats;

      meta.commentaryCount++;
      meta.newCommentary = this._id;
      meta.commentary.push(this);
      meta.latestPost = this.postDate;
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
        domain: [this.domain],
        commentary: [this._id],
        title: this.title,
        description: this.description,
        image: this.image,
      };
      let metaPost = new MetaPost(meta);
      meta = await metaPost.save();
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
    let updatePosts = {
      _id: userId,
      type: 'UPDATE_POSTS_INVEST',
      payload: postInv,
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

PostSchema.statics.sendOutMentions = function(mentions, post, mUser, type) {
  return mentions.map((mention) => {
    let query = { _id: mention };
    if (mention === 'everyone') {
      query = {};
      if (mUser._id !== 'slava' && mUser._id !== 'balasan') return null;
    }

    User.find(query, 'deviceTokens')
    .then((users) => {
      users.forEach(user => {
        let alert = (mUser.name || mUser) + ' mentioned you in a ' + type;
        if (mention === 'everyone') alert = post.body;
        let payload = { 'Mention from': post.embeddedUser.name };
        apnData.sendNotification(user, alert, payload);
      });
    });

    if (mention === 'everyone') return null;

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
    return newDbNotification.save((err, notif) => {
      if (err) return console.log(err);
      let newNotifObj = {
        _id: mention,
        type: 'ADD_ACTIVITY',
        payload: notif
      };

      console.log('send out push notification');

      this.events.emit('postEvent', newNotifObj);
      return notif;
    });
  });
};

module.exports = mongoose.model('Post', PostSchema);
