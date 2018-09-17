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
    let url = `${process.env.API_SERVER}/confirm/${user._id}/${user.confirmCode}`;
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
    query = email ? { email: string } : { _id: string };
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
  res.status(200).json({ email: user.email, username: user._id });
};

exports.confirm = async (req, res, next) => {
  let user;
  let middleware = false;
  if (req.params.user) middleware = true;
  try {
    let confirmCode = req.params.code || req.body.code;
    let _id = req.params.user || req.body.user;
    if (!_id || !confirmCode) throw new Error('Missing user id or confirmation token');
    user = await User.findOne({ _id, confirmCode }, 'confirmCode confirmed email');
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
    let user = await User.findOne({ _id: req.user._id }, 'email confirmCode');
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
  let user = req.user._id;
  let step = req.params.step;
  User.findOneAndUpdate(
    { _id: user },
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
        { _id: name }
      ] },
      { _id: { $nin: blocked } }
    ]
  };
  User.find(query, 'name image')
  .sort({ _id: 1 })
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
    query = { ...query, _id: { $regex: formatted, $options: 'i' } };
  }
  if (email) {
    type = 'email';
    query = { email };
  }

  User.findOne(query, '_id')
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
      query = { community, tag: topic, user: { $nin: blocked } };
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
  } catch (err) {
    console.log('user list error ', err);
    res.status(500).json(err);
  }

  return res.status(200).json(users);
};

/**
 * Creates a new user
 */
exports.create = async (req, res) => {
  try {
    let community = req.subdomain || 'relevant';

    let token;
    let rand = await crypto.randomBytes(32);
    let confirmCode = rand.toString('hex');

    let user = req.body.user;

    let invite;
    if (community === 'relevant') {
      invite = await Invite.checkInvite(req.body.invite);
    }

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
      config.secrets.session,
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
exports.show = async function show(req, res) {
  let userId = req.params.id;
  if (!userId) userId = req.user._id;

  try {
    let community = req.subdomain || 'relevant';
    // don't show blocked user;
    let blocked = [];
    if (req.user) {
      let user = req.user;
      blocked = [...user.blocked || [], ...user.blockedBy || []];
      if (blocked.find(u => u === userId)) {
        return res.status(200).json({});
      }
    }

    let user = await User.findOne({ _id: userId });
    if (!user) throw new Error('no such user ', userId);
    user = await user.getSubscriptions();

    user = await user.getRelevance(community);

    // topic relevance
    let relevance = await Relevance.find({ user: userId, tag: { $ne: null } })
    .sort('-relevance')
    .limit(5);
    user = user.toObject();
    user.topTags = relevance || [];

    // user.topCategory = category[0];
    res.json(user);
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
      req.user._id !== req.params.id)) {
      throw new Error('no right to delete');
    }
    await User.findByIdAndRemove(req.params.id, (err) => {
      if (err) return res.send(500, err);
      return res.sendStatus(204);
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res) => {
  let role = req.user.role;
  let savedUser = null;
  let authUser = JSON.stringify(req.user._id);
  let reqUser = JSON.stringify(req.body._id);
  let updateImage = false;
  let updateName = false;
  let user;

  try {
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
        { user: user._id },
        { embeddedUser: newUser },
        { multi: true }
      );

      await Comment.update(
        { user: user._id },
        { embeddedUser: newUser },
        { multi: true }
      );
    }
  } catch (err) {
    return handleError(res, err);
  }

  return res.status(200).json(savedUser);
};

/**
 * Get my info
 */
exports.me = async (req, res) => {
  try {
    let community = req.subdomain || 'relevant';
    let userId = req.user._id;
    let user = await User.findOne({ _id: userId }, '-salt -hashedPassword');
    if (!user) return res.json(401);
    // TODO this is depricated
    user = await user.getRelevance(community);
    user = await user.getSubscriptions();
    return res.status(200).json(user);
  } catch (err) {
    return handleError(res, err);
  }
};


exports.block = async (req, res) => {
  let user = req.user;
  let block = req.body.block;

  try {
    if (user._id === block) throw new Error('You can\'t block yourself!');

    let userPromise = User.findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { blocked: block } },
      { new: true }
    );
    let blockPromise = User.findOneAndUpdate(
      { _id: block },
      { $addToSet: { blockedBy: user._id } },
      { new: true }
    );

    // clear any existing subscriptions
    let sub1 = Subscription.remove({ following: user._id, follower: block });
    let sub2 = Subscription.remove({ following: block, follower: user._id });
    let feed1 = Feed.remove({ userId: user._id, from: block });
    let feed2 = Feed.remove({ userId: block, from: user._id });

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
      { _id: user._id },
      { $pull: { blocked: block } },
      { new: true }
    );
    block = await User.findOneAndUpdate(
      { _id: block },
      { $pull: { blockedBy: user._id } },
    );
  } catch (err) {
    handleError(res, err);
  }
  res.status(200).json(user);
};

exports.blocked = async (req, res) => {
  let user = req.user;
  try {
    user = await User.findOne({ _id: user._id }).populate('blocked');
  } catch (err) {
    handleError(res, err);
  }
  res.status(200).json(user);
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

    let exists = await User.findOne({ ethAddress: acc }, '_id');
    if (exists) throw new Error('This address is already in use by @' + exists._id);

    user = await User.findOne({ _id: user._id }, 'ethAddress');
    user.ethAddress = [acc];
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Authentication callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/');
};
