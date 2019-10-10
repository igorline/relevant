import crypto from 'crypto-promise';
import uuid from 'uuid/v4';
import sigUtil from 'eth-sig-util';
import merge from 'lodash/merge';
import url from 'url';
// eslint-disable-next-line import/named
import { signToken } from 'server/auth/auth.service';
import Invite from 'server/api/invites/invite.model';
import mail from 'server/config/mail';
import { BANNED_USER_HANDLES, CASHOUT_MAX } from 'server/config/globalConstants';
import User from './user.model';
import Post from '../post/post.model';
import CommunityMember from '../community/community.member.model';
import Relevance from '../relevance/relevance.model';
import Subscription from '../subscription/subscription.model';
import Feed from '../feed/feed.model';
import * as ethUtils from '../../utils/ethereum';
import { logCashOut } from '../../utils/cashOut';

// async function getUserEmails(_users) {
//   const users = await User.find({ handle: { $in: _users } }, '+email');
//   users.map(u => console.log(u.handle, u.email));
// }
// getUserEmails([
//   'JoannaPope',
//   'commune_mist',
//   'charlixcx',
//   'clubinternet',
//   'Druss',
//   'mrcni',
//   'bamboo',
//   'mat',
//   'darkmatter',
// ]);

// User.findOneAndUpdate({ handle: 'test' }, { balance: 10000, cashOut: null }).exec();
// User.findOneAndUpdate({ handle: 'jennifar' }, { banned: true }).then(console.log);
// User.findOne({ handle: 'jennifar' }).then(console.log);
// const TwitterWorker = require('../../utils/twitterWorker');
// User.findOne({ email: 'tem-tam@hotmail.com' }, '+email +confirmCode')
// .then(u => u);
//
// sendConfirmation({ handle: 'feed', email: 'relevant.feed@gmail.com', confirmCode: 'xxx' });

// sendConfirmation({
//   email: 'slava@relevant.community',
//   handle: 'test',
//   confirmCode: 'xxx',
// });

async function sendConfirmation(user, newUser) {
  let text = '';
  if (newUser) text = ', welcome to Relevant';
  try {
    const confirmUrl = `${process.env.API_SERVER}/user/confirm/${user.handle}/${user.confirmCode}`;
    const data = {
      from: 'Relevant <info@relevant.community>',
      to: user.email,
      subject: 'Relevant Email Confirmation',
      html: `
        Hi @${user.handle}${text}!
      <br />
      <br />
        Please click on the link below to confirm your email address:
      <br />
      <br />
      <a href="${confirmUrl}" target="_blank">Confirm Email</a>
      <br />
      <br />
      `
    };
    await mail.send(data);
  } catch (err) {
    throw err;
  }
  return { email: user.email };
}

async function sendResetEmail(user, queryString) {
  let status;
  try {
    const resetUrl = `${process.env.API_SERVER}/user/resetPassword/${user.resetPasswordToken}${queryString}`;
    const data = {
      from: 'Relevant <info@relevant.community>',
      to: user.email,
      subject: 'Reset Relevant Password',
      html: `
      Hi, @${user.handle}
      <br/><br/>
      You are receiving this because you have requested the reset of the password for your account.<br />
      Please click on the following link, or paste this into your browser to complete the process:<br/><br/>
      ${resetUrl}<br/><br/>
      If you did not request a password reset, please ignore this email and your password will remain unchanged.`
    };
    status = await mail.send(data);
  } catch (err) {
    throw err;
  }
  return status;
}

exports.forgot = async (req, res, next) => {
  let email;
  try {
    const urlParts = url.parse(req.url, true);
    const queryString = urlParts.search || '';
    const string = req.body.user;

    email = /^.+@.+\..+$/.test(string);
    const query = email ? { email: string } : { handle: string };
    let user = await User.findOne(
      query,
      'resetPasswordToken resetPasswordExpires email handle'
    );
    const rand = await crypto.randomBytes(32);
    const token = rand.toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    user = await user.save();
    await sendResetEmail(user, queryString);
    return res.status(200).json({ email: user.email, username: user.handle });
  } catch (err) {
    let error = new Error("Couldn't find user with this name ", err);
    if (email) {
      error = new Error('No user with this email exists');
    }
    return next(error);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    let user;
    let middleware = false;
    if (!req.params) req.params = {};
    if (req.params.user) middleware = true;
    const confirmCode = req.params.code || req.body.code;
    const handle = req.params.user || req.body.user;
    if (!handle || !confirmCode) throw new Error('Missing user id or confirmation token');
    user = await User.findOne({ handle, confirmCode });
    if (!user) throw new Error('Wrong confirmation code');

    user.confirmed = true;
    user = await user.addReward({ type: 'email' });
    user = await user.save();
    req.confirmed = true;
    return middleware ? next() : res.status(200).json(user);
  } catch (err) {
    console.error(err); // eslint-disable-line
    return next();
  }
};

exports.sendConfirmationCode = async (req, res, next) => {
  try {
    let user = await User.findOne(
      { handle: req.user.handle },
      'email confirmCode name handle'
    );
    user.confirmCode = uuid();
    user = await user.save();
    const status = await sendConfirmation(user);
    return res.status(200).json(status);
  } catch (err) {
    return next(err);
  }
};

exports.webOnboard = (req, res, next) => {
  const { handle } = req.user;
  const { step } = req.params;
  const path = `webOnboard.${step}`;
  User.findOneAndUpdate(
    { handle },
    { $set: { [path]: true } },
    { projection: 'webOnboard', new: true }
  )
    .then(newUser => {
      res.status(200).json(newUser);
    })
    .catch(next);
};

exports.onboarding = (req, res, next) => {
  const { handle } = req.user;
  const { step } = req.params;
  User.findOneAndUpdate(
    { handle },
    { onboarding: step },
    { projection: 'onboarding', new: true }
  )
    .then(newUser => {
      res.status(200).json(newUser);
    })
    .catch(next);
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let { user } = req;
    if (!token && !user) throw new Error('token missing');
    if (!user) {
      user = await User.findOne({ resetPasswordToken: token });
      if (user && user.resetPasswordExpires > Date.now()) {
        throw new Error('Password reset time has expired');
      }
    }
    if (!user) throw new Error('No user found');
    if (!user.onboarding) user.onboarding = 0;

    user.password = password;
    user = await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Change a users password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const oldPass = String(req.body.oldPassword);
    const newPass = String(req.body.newPassword);
    const user = User.findById(userId);
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      await user.save();
      return res.sendStatus(200);
    }
    throw new Error('incorrect password');
  } catch (err) {
    return next(err);
  }
};

exports.search = (req, res, next) => {
  let blocked = [];
  const { user } = req;
  if (user) {
    blocked = [...user.blocked, ...user.blockedBy];
  }

  const { search, limit } = req.query;
  const name = new RegExp(search, 'i');
  const query = {
    $and: [{ $or: [{ name }, { handle: name }] }, { handle: { $nin: blocked } }]
  };
  User.find(query, 'handle name image')
    .sort({ handle: 1 })
    .limit(parseInt(limit, 10))
    .then(users => {
      res.json(200, users);
    })
    .catch(next);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = (req, res, next) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    const name = new RegExp(req.query.name, 'i');
    query = { name };
  }

  User.find(query, '-salt -hashedPassword')
    .sort({ rank: -1 })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(next);
};

exports.checkUser = async (req, res, next) => {
  try {
    const { name, email, omitSelf } = req.query;
    const { user } = req;
    let query = {};
    let type;

    if (name === 'everyone') {
      return res.status(200).json({ type });
    }
    let formatted;
    let omit;
    if (user && omitSelf) {
      omit = user.handle;
    }

    if (name) {
      type = 'user';
      formatted = '^' + name + '$';
      query = {
        ...query,
        $and: [
          { handle: { $regex: formatted, $options: 'i' } },
          { handle: { $ne: omit } }
        ]
      };
    } else if (email) {
      formatted = '^' + email + '$';
      type = 'email';
      query = {
        $and: [{ email: { $regex: formatted, $options: 'i' } }, { handle: { $ne: omit } }]
      };
    }

    const userExists = await User.findOne(query, '_id handle');
    if (userExists) return res.status(200).json(userExists);
    return res.status(200).json(null);
  } catch (err) {
    return next(err);
  }
};

exports.testData = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = parseInt(req.query.skip, 10) || 0;
    const community = req.query.community || 'relevant';
    const query = { global: true, community, pagerank: { $gt: 0 } };

    const rel = await Relevance.find(
      query,
      'pagerank level community communityId pagerankRaw'
    )
      .limit(limit)
      .skip(skip)
      // .sort(sort)
      .populate({
        path: 'user',
        select: 'handle name votePower image bio'
      });

    return res.status(200).json(rel);
  } catch (err) {
    return next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { user } = req;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = parseInt(req.query.skip, 10) || 0;
    let topic = req.query.topic || null;

    let blocked = [];
    if (user) {
      blocked = [...user.blocked, ...user.blockedBy];
    }
    const community = req.query.community || 'relevant';

    let query;
    let sort;
    if (topic && topic !== 'null') {
      // TODO should topic relevance be limited to community? maybe not?
      query = { tag: topic, community, user: { $nin: blocked } };
      sort = { relevance: -1 };
    } else {
      topic = null;
      sort = { pagerank: -1 };
      query = { global: true, community, user: { $nin: blocked } };
    }

    const rel = await Relevance.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .populate({
        path: 'user',
        select: 'handle name votePower image bio'
      });

    const users = rel.map(r => {
      r = r.toObject();
      if (!r.user) return null;
      let u = { ...r.user }; // eslint-disable-line
      u.relevance = {};
      delete r.user;
      if (topic) u[topic + '_relevance'] = r.relevance;
      else u.relevance = r;
      return u;
    });

    return res.status(200).json(users);
  } catch (err) {
    return next(err);
  }
};

/**
 * Creates a new user
 */
exports.create = async (req, res, next) => {
  try {
    const confirmCode = uuid();
    let { user } = req.body;
    const { invitecode } = req.body;

    if (BANNED_USER_HANDLES.includes(user.name)) {
      throw new Error('this username is taken');
    }
    if (!user.email) throw new Error('missing email');

    const userObj = {
      handle: user.name,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
      image: user.image,
      provider: 'local',
      role: 'user',
      relevance: 0,
      confirmCode
    };

    user = new User(userObj);
    user = await user.save();

    if (invitecode) {
      user = await Invite.processInvite({ invitecode, user });
    }
    // const confirmed = invite && invite.email === user.email;
    user = await user.initialCoins();
    // if (invite) user = await invite.referral(user);

    const token = signToken(user._id, 'user');
    if (!user.confirmed) sendConfirmation(user, true);

    user = await user.save();
    user = user.toObject();
    delete user.hashedPassword;
    delete user.salt;
    delete user.password;
    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get a single user
 */
exports.show = async function show(req, res, next) {
  try {
    let { user } = req;
    let handle = req.params.id;

    let me = null;
    let memberships;
    if (!handle && user) {
      handle = user.handle;
    }
    if (user && user._id) {
      memberships = await CommunityMember.find({ user: user._id });
    }
    me = user && user.handle === handle;
    const community = req.query.community || 'relevant';

    // don't show blocked user;
    let blocked = [];
    if (user) {
      blocked = [...(user.blocked || []), ...(user.blockedBy || [])];
      if (blocked.find(u => u === handle)) {
        return res.status(200).json({});
      }
    }

    const select = me ? '+email' : null;
    user = await User.findOne({ handle }, select).populate({
      path: 'relevance',
      match: { community, global: true },
      select: 'pagerank relevanceRecord community'
    });

    if (!user) throw new Error('no such user ', handle);
    user = await user.getSubscriptions();

    // topic relevance
    const relevance = await Relevance.find({ user: user._id, tag: { $ne: null } })
      .sort('-relevance')
      .limit(5);
    const userObj = user.toObject();
    userObj.topTags = relevance || [];

    res.status(200).json({ ...userObj, memberships });

    // update token balance based on ETH account
    if (me) {
      const addr = user.ethAddress[0];
      const tokenBalance = addr ? await ethUtils.getBalance(user.ethAddress[0]) : 0;
      if (user.tokenBalance !== tokenBalance) {
        user.tokenBalance = tokenBalance;
        user = await user.save();
        await user.updateClient();
      }
    }
    return null;
  } catch (err) {
    return next(err);
  }
};

/**
 * Deletes a user
 * restriction: 'admin' or user
 */
exports.destroy = async (req, res, next) => {
  try {
    if (
      !req.user ||
      (!req.user.role === 'admin' && req.user.handle !== req.params.handle)
    ) {
      throw new Error('no right to delete');
    }
    await User.findOne({ handle: req.params.id }).remove();
    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
};

exports.updateComunity = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) throw new Error('missing user');
    const { community } = req.body;
    user.community = community;
    await user.save();
    return res.status(200).json({ succcess: true });
  } catch (err) {
    return next(err);
  }
};

exports.updateHandle = async (req, res, next) => {
  try {
    let { user } = req;

    if (user.role !== 'temp') throw new Error('Cannot change user handle');

    const { handle, email } = req.body.user;
    if (!handle) throw new Error('missing handle');

    // make sure its not used
    if (handle !== user.handle) {
      const used = await User.findOne({ handle });
      if (used) throw new Error('This handle is already taken');
    }

    if (email && email !== user.email) {
      const usedEmail = await User.findOne({ _id: { $ne: user._id }, email });
      if (usedEmail) throw new Error('This email is already in use');
      user.email = email;

      user.confirmCode = uuid();
      user = await user.save();
      await sendConfirmation(user, true);
    }

    user.handle = handle;
    user.role = 'user';

    const newUser = {
      name: user.name,
      image: user.image,
      handle: user.handle,
      _id: user._id
    };

    await CommunityMember.updateMany(
      { user: user._id },
      { embeddedUser: newUser },
      { multi: true }
    );

    user = await user.save();

    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { role } = req.user;
    const authUser = JSON.stringify(req.user._id);
    const reqUser = JSON.stringify(req.body._id);
    let updateImage = false;
    let updateName = false;
    let user;

    if (authUser !== reqUser && role !== 'admin') {
      throw new Error('Not authorized to edit this user');
    }
    user = await User.findOne({ _id: req.body._id }, '-salt -hashedPassword -relevance');
    if (!user) throw new Error('user not found');

    if (user.name !== req.body.name) {
      updateName = true;
      user.name = req.body.name;
    }
    if (user.image !== req.body.image) {
      updateImage = true;
      user.image = req.body.image;
    }

    user.bio = typeof req.body.bio === 'string' ? req.body.bio : user.bio;
    user.deviceTokens = req.body.deviceTokens;

    if (role === 'admin') {
      user.role = req.body.role;
    }

    user = await user.save();
    user.updateClient();

    if (updateName || updateImage) {
      const newUser = {
        name: user.name,
        image: user.image,
        handle: user.handle,
        _id: user._id
      };

      // Do this on a separate thread?
      await Post.updateMany(
        { user: user._id },
        { embeddedUser: newUser },
        { multi: true }
      );

      await CommunityMember.updateMany(
        { user: user._id },
        { embeddedUser: newUser },
        { multi: true }
      );
    }
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

exports.block = async (req, res, next) => {
  try {
    let { user } = req;
    const { block } = req.body;

    if (user._id === block) throw new Error("You can't block yourself!");

    const userPromise = User.findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { blocked: block } },
      { new: true }
    );
    const blockPromise = User.findOneAndUpdate(
      { _id: block },
      { $addToSet: { blockedBy: user._id } },
      { new: true }
    );

    // clear any existing subscriptions
    const sub1 = Subscription.deleteMany({ following: user._id, follower: block }).exec();
    const sub2 = Subscription.deleteMany({ following: block, follower: user._id }).exec();
    const feed1 = Feed.deleteMany({ userId: user._id, from: block }).exec();
    const feed2 = Feed.deleteMany({ userId: block, from: user._id }).exec();

    const results = await Promise.all([
      userPromise,
      blockPromise,
      sub1,
      sub2,
      feed1,
      feed2
    ]);
    user = results[0];
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

exports.unblock = async (req, res, next) => {
  try {
    let { user } = req;
    let { block } = req.body;
    user = await User.findOneAndUpdate(
      { handle: user.handle },
      { $pull: { blocked: block } },
      { new: true }
    );
    block = await User.findOneAndUpdate(
      { _id: block },
      { $pull: { blockedBy: user._id } }
    );
    res.status(200).json(user);
  } catch (err) {
    next(res, err);
  }
};

exports.blocked = async (req, res, next) => {
  try {
    let { user } = req;
    user = await User.findOne({ _id: user._id }).populate('blocked');
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserTokenBalance = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user.ethAddress || !user.ethAddress.length) {
      throw new Error('missing connected Ethereum address');
    }
    const userBalance = await ethUtils.getBalance(user.ethAddress[0]);
    user.tokenBalance = userBalance;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserNotifications = async (req, res, next) => {
  try {
    const { user, body } = req;
    const { notificationSettings, subscription, deviceTokens } = body;
    const newSettings = merge(user.notificationSettings.toObject(), notificationSettings);
    user.notificationSettings = newSettings;
    if (subscription) {
      const findIndex = user.desktopSubscriptions.findIndex(
        s =>
          s.endpoint === subscription.endpoint &&
          s.keys &&
          s.keys.auth === subscription.keys.auth &&
          s.keys.p256dh === subscription.keys.p256dh
      );
      if (findIndex === -1) {
        user.desktopSubscriptions = [...user.desktopSubscriptions, subscription];
      }
    }
    if (deviceTokens) {
      user.deviceTokens = deviceTokens;
    }
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.ethAddress = async (req, res, next) => {
  try {
    let { user } = req;
    const { msg, sig, acc } = req.body;
    const recovered = sigUtil.recoverTypedSignature({
      data: msg,
      sig
    });
    if (recovered !== acc.toLowerCase()) throw new Error('address does not match');

    const exists = await User.findOne({ ethAddress: acc }, 'handle');
    if (exists) throw new Error('This address is already in use by @' + exists.handle);

    user = await User.findOne({ handle: user.handle }, 'ethAddress');
    user.ethAddress = [acc];

    const userBalance = await ethUtils.getBalance(user.ethAddress[0]);
    user.tokenBalance = userBalance;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.cashOut = async (req, res, next) => {
  try {
    const {
      user,
      body: { customAmount }
    } = req;
    if (!user) throw new Error('missing user');
    if (!customAmount) throw new Error('Missing amount');

    if (!user.ethAddress[0]) throw new Error('No Ethereum address connected');
    const address = user.ethAddress[0];

    // if the nonce is the same as last time, resend last signature
    const nonce = await ethUtils.getNonce(address);

    // Prioritize last withdrawal attempt
    if (user.cashOut && user.cashOut.nonce === nonce) {
      return res.status(200).json(user);
    }

    // Temp - let global admins cash out more
    const maxClaim = user.role === 'admin' ? 1000 * 1e6 : CASHOUT_MAX - user.cashedOut;

    const canClaim = Math.min(maxClaim, user.balance - (user.airdroppedTokens || 0));
    const amount = customAmount;

    if (amount > maxClaim)
      throw new Error(`You cannot claim more than ${maxClaim} coins at this time.`);

    if (amount > canClaim) throw new Error('You con not claim this many coins.');
    if (amount <= 0) throw new Error('You do not have enough coins to claim.');

    // if (amount < 100) throw new Error('Balance is too small to withdraw');
    const allocatedRewards = await ethUtils.getParam('allocatedRewards');

    if (allocatedRewards < amount) {
      throw new Error(
        'There are not enough funds allocated in the contract at the moment'
      );
    }

    logCashOut(user, amount, next);

    user.balance -= amount;
    user.cashedOut += amount;
    await user.save();

    const { sig, amount: bnAmount } = await ethUtils.sign(address, amount);
    user.nonce = nonce;
    user.cashOut = { sig, amount: bnAmount, nonce };
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

/**
 * Authentication callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/');
};
