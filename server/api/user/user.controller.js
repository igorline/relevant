import jwt from 'jsonwebtoken';
import crypto from 'crypto-promise';

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
// mail.test();

// User.findOneAndUpdate({ _id: 'slava' }, { role: 'admin' }).exec();

// User.findOneAndUpdate({ _id: 'Analisa' }, { role: 'admin' }).exec();
// User.findOneAndUpdate({ _id: 'jay' }, { role: 'admin' }).exec();
// User.findOneAndUpdate({ _id: 'phillip' }, { role: 'admin' }).exec();


// User.findOne({ email: 'byslava@gmail.com' }, (err, user) => {
//   if (user) user.remove();
// });

let validationError = (res, err) => {
  console.log(err);
  return res.status(422).json(err);
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).json({ message: err.message });
}

async function sendConfirmation(user, newUser) {
  let status;
  let text = '';
  if (newUser) text = 'Welcome to relevant! ';
  try {
    console.log('sending email', user.email);
    let url = `${process.env.API_SERVER}/confirm/${user._id}/${user.confirmCode}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Email Confirmation',
      html: `${text}Click on this link to confirm your email address:
      <br />
      <br />
      <a href="${url}" target="_blank">${url}</a>
      <br />
      <br />
      Once you confirm your email we will send you additional invite codes to invite your friends!`
    };
    status = await mail.send(data);
  } catch (err) {
    console.log('mail error ', err);
    throw err;
  }
  return status;
}

async function sendResetEmail(user) {
  let status;
  try {
    let url = `${process.env.API_SERVER}/resetPassword/${user.resetPasswordToken}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: user.email,
      subject: 'Reset Password',
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
    user = await User.findOne(query);
    let rand = await crypto.randomBytes(32);
    let token = rand.toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    user = await user.save();
    await sendResetEmail(user);
  } catch (err) {
    let error = new Error('Couldn\'t find user with this name');
    if (email) {
      error = new Error('No user with this email exists');
    }
    handleError(res, error);
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
      Invite.generateCodes(user);
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
    let user = req.user;
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
    if (topic && topic !== 'null') {
      let query = { tag: topic, user: { $nin: blocked } };
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
    } else {
      users = await User.find({ _id: { $nin: blocked } })
      .limit(limit)
      .skip(skip)
      .sort({ relevance: -1 });
    }
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
  let startingAmount = 10;
  let token;

  try {
    let rand = await crypto.randomBytes(32);
    let confirmCode = rand.toString('hex');
    let user = req.body.user;
    let invite = req.body.invite;
    invite = await Invite.findOne({ _id: invite._id, redeemed: false });
    if (!invite) throw new Error('No invitation code found');

    let confirmed = invite.email === user.email;

    let userObj = {
      _id: user.name,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
      image: user.image,
      provider: 'local',
      role: 'user',
      relevance: 0,
      balance: startingAmount,
      confirmed,
      confirmCode
    };

    user = new User(userObj);
    user = await user.save();

    invite.status = 'registered';
    invite.redeemed = true;
    invite = await invite.save();

    token = jwt.sign(
      { _id: user._id },
      config.secrets.session,
      { expiresIn: 60 * 5 * 60 }
    );

    if (!confirmed) sendConfirmation(user, true);
    else Invite.generateCodes(user);
  } catch (err) {
    return handleError(res, err);
  }

  return res.status(200).json({ token });

  // let earningsObj = {
  //   user: newUser._id,
  //   source: 'treasury',
  //   amount: startingAmount
  // };

  // let earnings = new Earnings(earningsObj);
  // let saveEarnings = () => earnings.save();

  // let updateTreasury = () =>
  //   Treasury.findOneAndUpdate(
  //     {},
  //     { $inc: { balance: -startingAmount, out: startingAmount } },
  //     { new: true, upsert: true }
  //   ).exec();
    // let dbNotificationObj = {
    //   post: null,
    //   forUser: null,
    //   byUser: user._id,
    //   amount: null,
    //   type: 'newUser',
    //   personal: false,
    //   read: false,
    //   tag: null
    // };
};

/**
 * Get a single user
 */
exports.show = async function (req, res) {
  let userId = req.params.id;
  if (!userId) userId = req.user._id;

  try {
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
    user = await user.getSubscriptions();

    let relevance = await Relevance.find({ user: userId, tag: { $ne: null } })
    .sort('-relevance')
    .limit(5);

    // let category = await Relevance.find({ user: userId, category: { $ne: null } })
    // .sort('-relevance')
    // .limit(1);
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
 * restriction: 'admin'
 */
exports.destroy = (req, res) => {
  User.findByIdAndRemove(req.params.id, (err) => {
    if (err) return res.send(500, err);
    return res.sendStatus(204);
  });
};

exports.update = (req, res) => {
  let role = req.user.role;
  let savedUser = null;
  let authUser = JSON.stringify(req.user._id);
  let reqUser = JSON.stringify(req.body._id);

  if (authUser !== reqUser && role !== 'admin') return res.send(403);

  User.findById(req.body._id, '-salt -hashedPassword')
  .then((user) => {
    user.name = req.body.name;
    user.image = req.body.image;

    user.deviceTokens = req.body.deviceTokens;
    if (role === 'admin') {
      user.role = req.body.role;
    }
    return user.save();
  })
  .then((user) => {
    savedUser = user;

    let newUser = {
      name: user.name,
      image: user.image
    };

    // Do this on a separate thread?
    Post.update(
      { user: user._id },
      { embeddedUser: newUser },
      { multi: true }
    )
    .then(() =>
      Comment.update(
        { user: user._id },
        { embeddedUser: newUser },
        { multi: true }
      )
    )
    .catch(err => console.log(err));
  })
  .then(() => {
    res.status(200).json(savedUser);
  })
  .catch(err => console.log(err));
  return null;
};

/**
 * Get my info
 */
exports.me = (req, res, next) => {
  let userId = req.user._id;
  User.findOne({ _id: userId }, '-salt -hashedPassword')
  .exec((err, user) => {
    if (err) return next(err);
    if (!user) return res.json(401);
    return user.getSubscriptions()
    .then((_user) => {
      res.status(200).json(_user);
    });
  });
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
    handleError(res, err);
  }
  res.status(200).json(user);
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

/**
 * Authentication callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/');
};
