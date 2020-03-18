import mongoose from 'mongoose';
import socketEvent from 'server/socket/socketEvent';
import {
  newUserCoins,
  POWER_REGEN_INTERVAL,
  MAX_AIRDROP,
  getRewardForType
} from '../../config/globalConstants';
import { NAME_PATTERN } from '../../../app/utils/text';
import * as ethUtils from '../../utils/ethereum';

const crypto = require('crypto');

const authTypes = ['github', 'twitter', 'facebook', 'google', 'reddit', 'web3'];
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    // Comment out to automatically generate _id
    // _id: { type: Schema.Types.Object, required: true },
    handle: { type: String, unique: true, required: true },
    publicKey: { type: String, unique: true, sparse: true },
    name: String,
    email: { type: String, lowercase: true, select: false },
    phone: { type: String, select: false },
    role: {
      type: String,
      default: 'user'
    },
    online: { type: Boolean, default: false },
    messages: { type: Number, default: 0 },

    // keep this - hack to keep relevance out, but not have it overridden by toObject
    // relevance: { type: Number, default: 0, select: false },

    balance: { type: Number, default: 0 },
    lockedTokens: { type: Number, default: 0 },

    deviceTokens: {
      // select: false,
      type: [String]
    },
    image: String,
    hashedPassword: { type: String, select: false },
    provider: String,
    salt: { type: String, select: false },
    facebook: {},
    twitter: { type: Object, select: false },
    reddit: { type: Object, select: false },
    notificationSettings: {
      bet: { manual: { type: Boolean, default: false } },
      email: {
        digest: { type: Boolean, default: true },
        general: { type: Boolean, default: false },
        personal: { type: Boolean, default: true }
      },
      mobile: { all: { type: Boolean, default: false } },
      desktop: { all: { type: Boolean, default: false } }
    },
    desktopSubscriptions: [],
    redditId: String,
    redditAuth: { type: Object, select: false },
    google: {},
    github: {},

    postCount: { type: Number, default: 0 },
    investmentCount: { type: Number, default: 0 },
    onboarding: { type: Number, default: 0 },

    webOnboard: {
      type: Schema.Types.Mixed,
      default: {
        onboarding: false
      }
    },

    lastFeedNotification: { type: Date, default: new Date(0) },
    confirmed: { type: Boolean, default: false },
    confirmCode: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    following: Number,
    followers: Number,

    votePower: { type: Number, default: 1 },
    lastVote: { type: Date, default: new Date() },

    bio: { type: String, default: '' },

    blocked: {
      type: [{ type: Schema.Types.Object, ref: 'User' }],
      select: false
    },
    blockedBy: {
      type: [{ type: Schema.Types.Object, ref: 'User' }],
      select: false
    },

    level: Number,
    rank: Number,
    percentRank: Number,
    topTopics: [{ type: String, ref: 'Tag' }],
    totalUsers: Number,

    accumilatedDecay: { type: Number, select: false },
    estimatedPayout: { type: Number },
    lastPayout: { type: Number },

    twitterHandle: { type: String },
    twitterImage: { type: String },
    twitterEmail: { type: String, select: false },
    twitterAuthToken: { type: String, select: false },
    twitterAuthSecret: { type: String, select: false },
    twitterId: { type: String, unique: true, index: true, sparse: true },

    // used to query twitter feed
    lastTweetId: { type: Number },

    tokenBalance: { type: Number, default: 0 },
    cashedOut: { type: Number, default: 0 },
    ethAddress: [String],

    // eth cash out
    cashOut: {
      nonce: String,
      sig: String,
      amount: String,
      earningId: String
    },
    airdropTokens: { type: Number, default: 0 },
    referralTokens: { type: Number, default: 0 },
    legacyTokens: { type: Number, default: 0 },
    legacyAirdrop: { type: Number, default: 0 },

    ethLogin: { type: String },
    // boxDID: { type: String },
    // boxAddress: { type: String },

    version: String,
    community: String,
    banned: Boolean
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

UserSchema.index(
  { ethLogin: 1 },
  { unique: true, partialFilterExpression: { ethLogin: { $exists: true } } }
);

UserSchema.index({ handle: 1 });

/**
 * Virtuals
 */
// TODO use this in controller
UserSchema.virtual('relevance', {
  ref: 'CommunityMember',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

UserSchema.virtual('password')
  .set(function setPassword(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function getPassword() {
    return this._password;
  });

// Public profile information
UserSchema.virtual('profile').get(function getProfile() {
  return {
    name: this.name,
    role: this.role
  };
});

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get(function getToken() {
  return {
    _id: this._id,
    role: this.role
  };
});

/**
 * Validations
 */

// Validate handle
UserSchema.path('handle').validate(
  handle => NAME_PATTERN.test(handle),
  'Username can only contain letters, numbers, dashes and underscores'
);

// Validate _id
UserSchema.path('_id').validate(
  handle => NAME_PATTERN.test(handle),
  'Username can only contain letters, numbers, dashes and underscores'
);

// Validate empty email
UserSchema.path('email').validate(function vEmail(email) {
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email.length;
}, 'Email cannot be blank');

// Validate empty password
UserSchema.path('hashedPassword').validate(function vHashedPassword(hashedPassword) {
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashedPassword.length;
}, 'Password cannot be blank');

// Validate email is not taken
UserSchema.path('email').validate(function vEmailTaken(value) {
  this.constructor.findOne({ email: value }, (err, user) => {
    if (err) throw err;
    if (user) {
      if (this.id === user.id) return true;
      return false;
    }
    return true;
  });
}, 'The specified email address is already in use.');

const validatePresenceOf = value => value && value.length;

/**
 * Pre-save hook
 */
UserSchema.pre('save', async function preSave(next) {
  try {
    this.postCount = await this.model('Post').countDocuments({ user: this._id });
    if (!this.isNew) return next();

    if (
      !validatePresenceOf(this.hashedPassword) &&
      authTypes.indexOf(this.provider) === -1
    ) {
      return next(new Error('Invalid password'));
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.pre('remove', async function preRemove(next) {
  try {
    await this.model('CommunityMember')
      .deleteMany({ user: this._id })
      .exec();
    next();
  } catch (err) {
    next(err);
  }
  return null;
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function encryptPassword(password) {
    if (!password || !this.salt) return '';
    const salt = Buffer.from(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  },

  // get following and followers
  getSubscriptions: function getSubscriptions() {
    return this.model('Subscription')
      .countDocuments({ follower: this._id })
      .then(following => {
        this.following = following;
        return this.model('Subscription').countDocuments({ following: this._id });
      })
      .then(followers => {
        this.followers = followers;
        return this;
      })
      .catch(() => this);
  }
};

UserSchema.methods.getRelevance = async function getRelevance(community) {
  const rel = await this.model('CommunityMember').findOne({
    community,
    user: this._id
  });
  this.relevance = rel ? rel.relevance : 0;
  return this;
};

UserSchema.methods.updatePostCount = async function updatePostCount() {
  this.postCount = await this.model('Post').countDocuments({ user: this._id });
  await this.save();
  await this.updateClient();
  return this;
};

UserSchema.methods.updateClient = function updateClient(actor) {
  const userData = {
    _id: this._id,
    type: 'UPDATE_USER',
    payload: this
  };
  socketEvent.emit('socketEvent', userData);
  if (actor) {
    userData._id = actor._id;
    socketEvent.emit('socketEvent', userData);
  }
};

UserSchema.methods.updateMeta = async function updateMeta() {
  const newUser = {
    name: this.name,
    image: this.image,
    _id: this._id,
    handle: this.handle
  };

  await this.model('Post').updateMany(
    { user: this._id },
    { embeddedUser: newUser },
    { multi: true }
  );

  await this.model('CommunityMember').updateMany(
    { user: this._id },
    { embeddedUser: newUser },
    { multi: true }
  );
  return true;
};

UserSchema.methods.addReward = async function addReward({ type, user, extraRewards }) {
  const amount = getRewardForType(type) + (extraRewards || 0);
  const airdropTokens = Math.min(amount, MAX_AIRDROP - this.airdropTokens);

  if (airdropTokens <= 0) return this;

  // TODO - update this and tie it to smart contract
  await this.model('Treasury')
    .findOneAndUpdate(
      {},
      { $inc: { balance: -airdropTokens } },
      { new: true, upsert: true }
    )
    .exec();

  this.balance += airdropTokens;
  this.airdropTokens += airdropTokens;
  if (type === 'referral' || type === 'publicLink') {
    this.referralTokens += airdropTokens;
  }

  const notification = {
    forUser: this._id,
    type: `reward_${type}`,
    coin: airdropTokens,
    byUser: user ? user._id : null,
    byUsersHandle: user ? [user.handle] : null
  };
  await this.model('Notification').createNotification(notification);

  return this.save();
};

UserSchema.methods.initialCoins = async function initialCoins(invite) {
  const airdropTokens = newUserCoins(this, invite);

  if (!airdropTokens) return this;
  // TODO - update this and tie it to smart contract
  await this.model('Treasury')
    .findOneAndUpdate(
      {},
      { $inc: { balance: -airdropTokens } },
      { new: true, upsert: true }
    )
    .exec();

  this.balance += airdropTokens;
  this.airdropTokens += airdropTokens;

  const type = this.twitterId ? 'twitter' : 'email';
  const notification = {
    forUser: this._id,
    type: `reward_${type}`,
    coin: airdropTokens
  };
  await this.model('Notification').createNotification(notification);

  return this.save();
};

UserSchema.methods.updateBalance = async function updateBalance() {
  const ethAddress = this.ethAddress[0];
  if (ethAddress) {
    this.tokenBalance = await ethUtils.getBalance(ethAddress);
  }
  return this;
};

UserSchema.methods.updatePower = function updatePower() {
  // elapsed time in seconds
  // prevent votes from being more often than 5s apart
  const now = new Date();
  this.lastVote = now;
  const elapsedTime = new Date(now).getTime() - new Date(this.lastVote || 0).getTime();
  const voteRegen = Math.max((elapsedTime / POWER_REGEN_INTERVAL) * 1);
  const votePower = Math.min(this.votePower + voteRegen, 1);
  this.votePower = votePower;
  // async?
  this.save();
  return this;
};

UserSchema.methods.ensureParam = async function ensureParam(param) {
  if (this[param] !== undefined) return this;
  const getParam = await this.model('User').findOne({ _id: this._id }, '+param');
  this[param] = getParam[param];
  return this;
};

// export default mongoose.model('User', UserSchema);
module.exports = mongoose.model('User', UserSchema);
