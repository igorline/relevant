import jwt from 'jsonwebtoken';
import crypto from 'crypto-promise';
import sigUtil from 'eth-sig-util';

import User from './user.model';
import Comment from '../comment/comment.model';
import Post from '../post/post.model';
import config from '../../config/config';
// import Treasury from '../treasury/treasury.model';
// import Earnings from '../earnings/earnings.model';
import Relevance from '../relevance/relevance.model';
import mail from '../../mail';
import Invite from '../invites/invite.model';
import Subscription from '../subscription/subscription.model';
import Feed from '../feed/feed.model';
import * as ethUtils from '../../utils/ethereum';

const TwitterWorker = require('../../utils/twitterWorker');

// User.findOne({ _id: 'test'}, 'hashedPassword')
// .then(u => console.log(u))

// User.collection.dropIndexes(function (err, results) {
//   console.log(err);
// });

// User.findOneAndUpdate({ _id: 'slava' }, { role: 'admin' }).exec();
// User.findOneAndUpdate({ _id: 'Analisa' }, { role: 'admin' }).exec();
// User.findOneAndUpdate({ _id: 'jay' }, { role: 'user' }).exec();
// User.findOneAndUpdate({ _id: 'phillip' }, { role: 'user' }).exec();
// User.findOneAndUpdate({ _id: 'balasan' }, { role: 'admin' }).exec();
// User.findOneAndUpdate({ _id: 'test' }, { role: 'admin', confirmed: true }).exec();
// async function notifications() {
//   try {
//     let users = await User.find({ 'deviceTokens.0': { $exists: true } });
//     console.log('not enabled ', users.length)
//     users.forEach(user => {
//       console.log(user._id);
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }
// notifications();

// User.update({}, { onboarding: 0 }, { multi: true }).exec();

// User.find({ confirmed: false }, '_id')
// .then(users => console.log(users));

let validationError = (res, err) => {
  console.log(err);
  return res.status(422).json(err);
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).json({ message: err.message });
}

async function sendConfirmation(user, newUser) {
  let text = '';
  if (newUser) text = 'Welcome to Relevant! ';
  try {
    console.log('sending email', user.email);
    let url = `${process.env.API_SERVER}/confirm/${user.handle}/${user.confirmCode}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Relevant Email Confirmation',
      html: `${text}Click on this link to confirm your email address:
      <br />
      <br />
      <a href="${url}" target="_blank">${url}</a>
      <br />
      <br />
      Once you confirm your email you will be able to invite your friends to the app!
      `
    };
    await mail.send(data);
  } catch (err) {
    console.log('mail error ', err);
    throw err;
  }
  return { email: user.email };
}

async function sendResetEmail(user) {
  let status;
  try {
    let url = `${process.env.API_SERVER}/resetPassword/${user.resetPasswordToken}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Reset Relevant Password',
      html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br />
      Please click on the following link, or paste this into your browser to complete the process:<br/><br/>
      ${url}<br/><br/>
      If you did not request this, please ignore this email and your password will remain unchanged.`
    };
    status = await mail.send(data);
  } catch (err) {
    throw err;
  }
  return status;
}

exports.forgot = async (req, res) => {
  let string = req.body.user;
  let user;
  let email;
  try {
    let query;
    email = /^.+@.+\..+$/.test(string);
    query = email ? { email: string } : { handle: string };
    user = await User.findOne(query, 'resetPasswordToken resetPasswordExpires email');
    let rand = await crypto.randomBytes(32);
    let token = rand.toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    user = await user.save();
    await sendResetEmail(user);
  } catch (err) {
    let error = new Error('Couldn\'t find user with this name ', err);
    if (email) {
      error = new Error('No user with this email exists');
    }
    return handleError(res, error);
  }
  res.status(200).json({ email: user.email, username: user.handle });
};

exports.confirm = async (req, res, next) => {
  let user;
  let middleware = false;
  if (req.params.user) middleware = true;
  try {
    let confirmCode = req.params.code || req.body.code;
    let handle = req.params.user || req.body.user;
    if (!handle || !confirmCode) throw new Error('Missing user id or confirmation token');
    user = await User.findOne({ handle, confirmCode }, 'confirmCode confirmed email');
    if (user && !user.confirmed) {
      // Invite.generateCodes(user);
      user.confirmed = true;
      user = await user.save();
    } else {
      req.unconfirmed = true;
    }
    if (!user) throw new Error('Wrong confirmation code');
  } catch (err) {
    console.log('error confirmig code ', err);
    return middleware ? next() : handleError(res, err);
  }
  return middleware ? next() : res.status(200).json(user);
};

exports.sendConfirmationCode = async (req, res) => {
  let status;
  try {
    let user = await User.findOne({ handle: req.user.handle }, 'email confirmCode');
    let rand = await crypto.randomBytes(32);
    let token = rand.toString('hex');
    user.confirmCode = token;
    user = await user.save();
    status = await sendConfirmation(user);
  } catch (err) {
    return handleError(res, err);
  }
  console.log('status ', status);
  res.status(200).json(status);
};

exports.onboarding = (req, res) => {
  let handle = req.user.handle;
  let step = req.params.step;
  User.findOneAndUpdate(
    { handle },
    { onboarding: step },
    { projection: 'onboarding', new: true }
  )
  .then(newUser => {
    res.status(200).json(newUser);
  })
  .catch(err => handleError(res, err));
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
  try {
    let token = req.body.token;
    if (!token) throw new Error('token missing');
    let user = await User.findOne({ resetPasswordToken: token });
    if (!user) throw new Error('No user found');
    if (!user.onboarding) user.onboarding = 0;
    let password = req.body.password;
    if (user.resetPasswordExpires > Date.now()) {
      throw new Error('Password reset time has expired');
    }
    user.password = password;
    user = await user.save();
  } catch (err) {
    handleError(res, err);
  }
  return res.status(200).json({ success: true });
};


/**
 * Change a users password
 */
exports.changePassword = (req, res) => {
  let userId = req.user._id;
  let oldPass = String(req.body.oldPassword);
  let newPass = String(req.body.newPassword);

  User.findById(userId, (err, user) => {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(saveErr => {
        if (saveErr) return validationError(res, saveErr);
        return res.sendStatus(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.search = (req, res) => {
  let blocked = [];
  if (req.user) {
    let user = req.user;
    blocked = [...user.blocked, ...user.blockedBy];
  }

  const search = req.query.search;
  const limit = req.query.limit;
  const name = new RegExp(search, 'i');
  let query = {
    $and: [
      { $or: [
        { name },
        { handle: name }
      ] },
      { handle: { $nin: blocked } }
    ]
  };
  User.find(query, 'name image')
  .sort({ handle: 1 })
  .limit(parseInt(limit, 10))
  .then((users) => {
    res.json(200, users);
  })
  .catch(err => handleError(res, err));
};


/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = (req, res) => {
  const search = req.query.search;
  let query = {};
  if (search) {
    const name = new RegExp(req.query.name, 'i');
    query = { name };
  }

  User.find(query, '-salt -hashedPassword').sort({ rank: -1 })
  .then((users) => {
    res.status(200).json(users);
  })
  .catch(err => handleError(res, err));
};

exports.checkUser = (req, res) => {
  let name = req.query.name;
  let email = req.query.email;
  let query = {};
  let type;

  if (name === 'everyone') {
    return handleError(res, new Error('username taken'));
  }

  if (name) {
    type = 'user';
    let formatted = '^' + name + '$';
    query = { ...query, handle: { $regex: formatted, $options: 'i' } };
  }
  if (email) {
    type = 'email';
    query = { email };
  }

  User.findOne(query, 'handle')
  .then((user) => {
    if (user) res.status(200).json({ type });
    else res.status(200).json(null);
  })
  .catch(err => handleError(res, err));
};

exports.list = async (req, res) => {
  let limit = parseInt(req.query.limit, 10) || 5;
  let skip = parseInt(req.query.skip, 10) || 0;
  let topic = req.query.topic || null;
  let users;

  let blocked = [];
  if (req.user) {
    let user = req.user;
    blocked = [...user.blocked, ...user.blockedBy];
  }

  try {
    let community = req.subdomain || 'relevant';
    let query;
    if (topic && topic !== 'null') {
      // TODO should topic relevance be limited to community? maybe not?
      query = { tag: topic, user: { $nin: blocked } };
    } else query = { global: true, community, user: { $nin: blocked } };

    let rel = await Relevance.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ relevance: -1 })
    .populate('user');
    users = rel.map(r => {
      r = r.toObject();
      r.user[topic + '_relevance'] = r.relevance;
      return r.user;
    });
    // } else {
    //   users = await User.find({ _id: { $nin: blocked } })
    //   .limit(limit)
    //   .skip(skip)
    //   .sort({ relevance: -1 });
    // }
    // console.log('got users ', users);
  } catch (err) {
    console.log('user list error ', err);
    res.status(500).json(err);
  }

  return res.status(200).json(users);
};


/**
 * Creates a new user
 */
exports.create = async (req, res, next) => {
  try {
    let community = req.subdomain || 'relevant';

    let token;
    let rand = await crypto.randomBytes(32);
    let confirmCode = rand.toString('hex');

    let user = req.body.user;

    let invite;
    // if (community === 'relevant') {
    //   invite = await Invite.checkInvite(req.body.invite);
    // }

    let confirmed = invite && invite.email === user.email;

    if (user.name === 'everyone') throw new Error('username taken');

    let userObj = {
      _id: user.name,
      handle: user.name,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
      image: user.image,
      provider: 'local',
      role: 'user',
      relevance: 0,
      confirmed,
      confirmCode
    };

    user = new User(userObj);
    user = await user.save();

    if (invite) {
      await invite.registered(user);
    }

    token = jwt.sign(
      { _id: user._id },
      process.env.SESSION_SECRET,
      { expiresIn: 60 * 5 * 60 }
    );

    if (!confirmed) sendConfirmation(user, true);
    // else Invite.generateCodes(user);

    user = await user.initialCoins();
    user = await user.save();

    return res.status(200).json({ token, user });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Get a single user
 */
exports.show = async function show(req, res, next) {
  try {
    let handle = req.params.id;
    let me = null;
    if (!handle) {
      handle = req.user.handle;
      me = true;
    }

    let community = req.subdomain || 'relevant';
    // don't show blocked user;
    let blocked = [];
    if (req.user) {
      let user = req.user;
      blocked = [...user.blocked || [], ...user.blockedBy || []];
      if (blocked.find(u => u === handle)) {
        return res.status(200).json({});
      }
    }

    let user = await User.findOne({ handle });
    if (!user) throw new Error('no such user ', handle);
    user = await user.getSubscriptions();

    user = await user.getRelevance(community);

    // topic relevance
    let relevance = await Relevance.find({ user: handle, tag: { $ne: null } })
    .sort('-relevance')
    .limit(5);
    let userObj = user.toObject();
    userObj.topTags = relevance || [];

    // user.topCategory = category[0];
    res.status(200).json(userObj);

    // update token balance based on ETH account
    if (me) {
      let addr = user.ethAddress[0];
      let tokenBalance = addr ? await ethUtils.getBalance(user.ethAddress[0]) : 0;
      if (user.tokenBalance !== tokenBalance) {
        user.tokenBalance = tokenBalance;
        user = await user.save();
        await user.updateClient();
      }
    }
  } catch (err) {
    handleError(res, err);
  }
};

/**
 * Deletes a user
 * restriction: 'admin' or user
 */
exports.destroy = async (req, res, next) => {
  try {
    if (!req.user ||
      (!req.user.role === 'admin' &&
      req.user.handle !== req.params.handle)) {
      throw new Error('no right to delete');
    }
    await User.findOne({ handle: req.params.id }).remove();
    return res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.updateHandle = async (req, res, next) => {
  try {
    let user = req.user;
    let twitterId = user._id;
    if (user.role !== 'temp') throw new Error('Cannot change user handle');
    if (user._id !== user.twitterId.toString()) throw new Error('Cannot change user handle');

    let handle = req.body.user.handle;
    if (!handle) throw new Error('missing handle');

    // make sure its not used
    if (handle !== req.user.handle) {
      const used = await User.findOne({ handle });
      if (used) throw new Error('This handle is already taken');
    }

    user = await User.findOne(
      { _id: twitterId },
      '+email +twitterAuthSecret +twitterAuthToken +twitterEmail'
    );
    user = user.toObject();
    user.role = 'user';
    user.handle = handle;
    user._id = handle;

    let updatedUser = new User(user);

    await User.findOne({ _id: twitterId }).remove();

    user = updatedUser;

    let token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.SESSION_SECRET,
      { expiresIn: 60 * 5 * 60 }
    );

    await TwitterWorker.updateTwitterPosts(user._id);

    user = await user.initialCoins();
    user = await user.save();

    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    let role = req.user.role;
    let savedUser = null;
    let authUser = JSON.stringify(req.user._id);
    let reqUser = JSON.stringify(req.body._id);
    let updateImage = false;
    let updateName = false;
    let user;

    if (authUser !== reqUser && role !== 'admin') {
      throw new Error('Not authorized to edit this user');
    }
    user = await User.findOne({ _id: req.body._id }, '-salt -hashedPassword');
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
      console.log('updating posts and comments');
      let newUser = {
        name: user.name,
        image: user.image
      };

      // Do this on a separate thread?
      await Post.update(
        { user: user.handle },
        { embeddedUser: newUser },
        { multi: true }
      );

      await Comment.update(
        { user: user.handle },
        { embeddedUser: newUser },
        { multi: true }
      );
    }
    return res.status(200).json(savedUser);
  } catch (err) {
    return next(err);
  }
};

/**
 * Get my info
 */
// exports.me = async (req, res) => {
//   try {
//     let community = req.subdomain || 'relevant';
//     let userId = req.user._id;
//     let user = await User.findOne({ _id: userId }, '-salt -hashedPassword');
//     if (!user) return res.json(401);
//     // TODO this is depricated
//     user = await user.getRelevance(community);
//     user = await user.getSubscriptions();

//     res.status(200).json(user);

//     return null;
//   } catch (err) {
//     return handleError(res, err);
//   }
// };


exports.block = async (req, res) => {
  let user = req.user;
  let block = req.body.block;

  try {
    if (user.handle === block) throw new Error('You can\'t block yourself!');

    let userPromise = User.findOneAndUpdate(
      { handle: user.handle },
      { $addToSet: { blocked: block } },
      { new: true }
    );
    let blockPromise = User.findOneAndUpdate(
      { handle: block },
      { $addToSet: { blockedBy: user.handle } },
      { new: true }
    );

    // clear any existing subscriptions
    let sub1 = Subscription.remove({ following: user.handle, follower: block });
    let sub2 = Subscription.remove({ following: block, follower: user.handle });
    let feed1 = Feed.remove({ userId: user.handle, from: block });
    let feed2 = Feed.remove({ userId: block, from: user.handle });

    let results = await Promise.all([userPromise, blockPromise, sub1, sub2, feed1, feed2]);
    user = results[0];
  } catch (err) {
    return handleError(res, err);
  }
  return res.status(200).json(user);
};

exports.unblock = async (req, res) => {
  let user = req.user;
  let block = req.body.block;
  try {
    user = await User.findOneAndUpdate(
      { handle: user.handle },
      { $pull: { blocked: block } },
      { new: true }
    );
    block = await User.findOneAndUpdate(
      { handle: block },
      { $pull: { blockedBy: user.handle } },
    );
  } catch (err) {
    handleError(res, err);
  }
  res.status(200).json(user);
};

exports.blocked = async (req, res) => {
  let user = req.user;
  try {
    user = await User.findOne({ handle: user.handle }).populate('blocked');
  } catch (err) {
    handleError(res, err);
  }
  res.status(200).json(user);
};

exports.updateUserTokenBalance = async (req, res, next) => {
  try {
    let user = req.user;
    if (!user.ethAddress || !user.ethAddress.legnth) throw new Error('missing connected Ethereum address');
    let userBalance = await ethUtils.getBalance(user.ethAddress[0]);
    user.tokenBalance = userBalance;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.ethAddress = async (req, res, next) => {
  try {
    let user = req.user;
    const { msg, sig, acc } = req.body;
    const recovered = sigUtil.recoverTypedSignature({
      data: msg,
      sig
    });
    if (recovered !== acc.toLowerCase()) throw new Error('address does not match');

    let exists = await User.findOne({ ethAddress: acc }, 'handle');
    if (exists) throw new Error('This address is already in use by @' + exists.handle);

    user = await User.findOne({ handle: user.handle }, 'ethAddress');
    user.ethAddress = [acc];

    let userBalance = await ethUtils.getBalance(user.ethAddress[0]);
    user.tokenBalance = userBalance;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.cashOut = async (req, res, next) => {
  try {
    let user = req.user;
    if (!user) throw new Error('missing user');
    if (!user.ethAddress[0]) throw new Error('No Ethereum address connected');
    let amount = user.balance;
    let address = user.ethAddress[0];

    // if the nonce is the same as last time, resend last signature
    let nonce = await ethUtils.getNonce(address);
    if (user.cashOut && user.cashOut.nonce === nonce) {
      amount = user.cashOut.amount;
      // return res.status(200).json(user);
    }

    if (amount < 100) throw new Error('Balance is too small to withdraw');
    let distributedRewards = await ethUtils.getParam('distributedRewards');

    if (distributedRewards < amount) throw new Error('There are not enough funds in contract at the moment');

    // make sure we 0 out the balance
    user.balance = 0;
    await user.save();

    let sig = await ethUtils.sign(address, amount);
    user.nonce = nonce;
    user.cashOut = { sig, amount, nonce };
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
