import mongoose from 'mongoose';
import { EventEmitter } from 'events';
import { NEW_USER_COINS } from '../../config/globalConstants';

const crypto = require('crypto');

const authTypes = ['github', 'twitter', 'facebook', 'google'];
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id: { type: String, required: true },
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
  relevance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  deviceTokens: {
    // select: false,
    type: [String]
  },
  image: String,
  hashedPassword: { type: String, select: false },
  provider: String,
  salt: { type: String, select: false },
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  relevanceRecord: [{
    relevance: Number,
    time: Date,
  }],
  postCount: { type: Number, default: 0 },
  investmentCount: { type: Number, default: 0 },
  onboarding: { type: Number, default: 0 },
  lastFeedNotification: { type: Date, default: new Date(0) },
  confirmed: { type: Boolean, default: false },
  confirmCode: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  following: Number,
  followers: Number,

  bio: { type: String, default: '' },

  blocked: {
    type: [{ type: String, ref: 'User' }],
    select: false,
  },
  blockedBy: {
    type: [{ type: String, ref: 'User' }],
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
  twitterId: { type: Number, unique: true, index: true, sparse: true },
  lastTweetId: { type: Number },

  tokenBalance: { type: Number, default: 0 },
  ethAddress: [String],

  // eth cash out
  cashOut: {
    nonce: Number,
    sig: String,
    amount: Number,
  },
}, {
  timestamps: true,
});

// UserSchema.index({ name: 'text' });

UserSchema.statics.events = new EventEmitter();
// UserSchema.index({ handle: 1 });

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      name: this.name,
      role: this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value) {
    let self = this;
    this.constructor.findOne({ email: value }, function (err, user) {
      if (err) throw err;
      if (user) {
        if (self.id === user.id) return true;
        return false;
      }
      return true;
    });
  }, 'The specified email address is already in use.');


let validatePresenceOf = value => value && value.length;

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', async function (next) {
    try {
      this.postCount = await this.model('Post').count({ user: this._id });
      if (!this.isNew) return next();

      if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
        next(new Error('Invalid password'));
      } else next();
    } catch (err) {
      console.log(err);
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
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  },

  // update user relevance and save record
  updateRelevanceRecord: async function (community) {
    if (!community) community = 'relevant';
    if (community === 'relevant') {
      if (!this.relevanceRecord) this.relevanceRecord = [];
      this.relevanceRecord.unshift({
        time: new Date(),
        relevance: this.relevance
      });
      this.relevanceRecord = this.relevanceRecord.slice(0, 10);
      console.log('this is depricated, remove in future versions');
    }

    // TODO test updateRelevanceRecord
    let relevance = await this.model('Relevance')
    .findOneAndUpdate(
      { user: this._id, community, global: true },
      { upsert: true, new: true }
    );
    // let relevanceRecord = relevance.relevanceRecord;
    // if (!relevanceRecord) relevanceRecord = [];
    // relevanceRecord.unshift({
    //   time: new Date(),
    //   relevance: this.relevance
    // });
    // relevanceRecord = this.relevanceRecord.slice(0, 10);
    // relevance.relevanceRecord = relevanceRecord;
    relevance.updateRelevanceRecord();
    await relevance.save();
    return this;
  },

  // get following and followers
  getSubscriptions: function () {
    // let user = this.toObject();
    return this.model('Subscription').count({ follower: this._id })
    .then((following) => {
      this.following = following;
      return this.model('Subscription').count({ following: this._id });
    })
    .then((followers) => {
      this.followers = followers;
      return this;
    })
    .catch(err => {
      console.log(err);
      return this;
    });
  },
};

UserSchema.methods.getRelevance = async function getRelevance(community) {
  try {
    let rel = await this.model('Relevance').findOne({ community, user: this._id, global: true });
    this.relevance = rel ? rel.relevance : 0;
    return this;
  } catch (err) {
    console.log('failed get relevance ', err);
  }
};

UserSchema.methods.updatePostCount = async function updatePostCount() {
  try {
    this.postCount = await this.model('Post').count({ user: this._id });
    await this.save();
    await this.updateClient();
  } catch (err) {
    console.log('failed to update post count ', err);
  }
  return this;
};

UserSchema.methods.updateClient = function updateClient(actor) {
  let userData = {
    _id: this._id,
    type: 'UPDATE_USER',
    payload: this
  };
  this.model('User').events.emit('userEvent', userData);

  if (actor) {
    userData._id = actor._id;
    this.model('User').events.emit('userEvent', userData);
  }
};

UserSchema.methods.updateMeta = async function updateMeta() {
  try {
    let newUser = {
      name: this.name,
      image: this.image
    };

    // Do this on a separate thread?
    await this.model('Post').update(
      { user: this._id },
      { embeddedUser: newUser },
      { multi: true }
    );

    await this.model('Comment').update(
      { user: this._id },
      { embeddedUser: newUser },
      { multi: true }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

UserSchema.methods.initialCoins = async function initialCoins() {
  await this.model('Treasury').findOneAndUpdate(
    {},
    { $inc: { balance: -NEW_USER_COINS } },
    { new: true, upsert: true }
  ).exec();

  this.balance += NEW_USER_COINS;
  return this;
};

module.exports = mongoose.model('User', UserSchema);
