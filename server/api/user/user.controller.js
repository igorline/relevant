import jwt from 'jsonwebtoken';

import User from './user.model';
import Comment from '../comment/comment.model';
import Post from '../post/post.model';
import config from '../../config/config';
// import Treasury from '../treasury/treasury.model';
// import Earnings from '../earnings/earnings.model';
import Relevance from '../relevance/relevance.model';

User.findOneAndUpdate({ _id: 'slava' }, { role: 'admin' }).exec();

let validationError = (res, err) => {
  console.log(err);
  return res.json(422, err);
};

function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}

exports.onboarding = (req, res) => {
  let user = req.user._id;
  let step = req.params.step;
  User.findOneAndUpdate(
    { _id: user },
    { onboarding: step },
    { projection: 'onboarding', new: true }
  )
  .then(newUser => {
    console.log(newUser);
    res.status(200).json(newUser);
  })
  .catch(err => handleError(res, err));
};

exports.search = (req, res) => {
  const search = req.query.search;
  const limit = req.query.limit;
  const name = new RegExp(search, 'i');
  let query = { $or: [{ name }, { _id: name }] };
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

exports.checkUsername = (req, res) => {
  let name = req.params.name;
  let formatted = '^' + name + '$';

  User.findOne({
    _id: { $regex: formatted, $options: 'i' },
  }, '_id')
  .then((user) => {
    res.status(200).json(user);
  })
  .catch(err => handleError(res, err));
};

exports.list = async (req, res) => {
  let limit = parseInt(req.query.limit, 10) || 5;
  let skip = parseInt(req.query.skip, 10) || 0;
  let topic = req.query.topic || null;
  let users;

  try {
    if (topic && topic !== 'null') {
      let query = { tag: topic };
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
      users = await User.find()
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
exports.create = (req, res) => {
  let startingAmount = 3;

  let userObj = {
    _id: req.body.name,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
    image: req.body.image,
    provider: 'local',
    role: 'user',
    relevance: 0,
    balance: startingAmount,
  };

  let newUser = new User(userObj);

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

  let sendResponse = () => {
    let token = jwt.sign(
      { _id: newUser._id },
      config.secrets.session,
      { expiresInMinutes: 60 * 5 }
    );
    res.status(200).json({ token });
  };

  newUser.save()
    .then(user => newUser = user)
    // .then(saveEarnings)
    // .then(updateTreasury)
    .then(sendResponse)
    .catch((err) => {
      console.log(err);
      handleError(res, err);
    });

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
    let user = await User.findOne({ _id: userId });
    user = await user.getSubscriptions();

    let relevance = await Relevance.find({ user: userId, tag: { $ne: null } })
    .sort('-relevance')
    .limit(5);

    // let category = await Relevance.find({ user: userId, category: { $ne: null } })
    // .sort('-relevance')
    // .limit(1);

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

/**
 * Authentication callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/');
};
