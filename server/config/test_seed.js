let User = require('../api/user/user.model');
let Subscription = require('../api/subscription/subscription.model');
let Post = require('../api/post/post.model');
let Feed = require('../api/feed/feed.model');
let Notification = require('../api/notification/notification.model');
let Invest = require('../api/invest/invest.model');
let MetaPost = require('../api/metaPost/metaPost.model');
let Earnings = require('../api/earnings/earnings.model');

let dummyUsers = [
  {
    _id: 'dummy1',
    provider: 'local',
    name: 'dummy1',
    phone: 'dummy1',
    email: 'dummy1@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    password: 'test',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 10,
    balance: 30,
    role: 'user',
    __v: 224,
  },
  {
    _id: 'dummy2',
    provider: 'local',
    name: 'dummy2',
    phone: 'dummy2',
    email: 'dummy2@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    password: 'test',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 100,
    balance: 10000,
    role: 'user',
    __v: 224,
  },
  {
    _id: 'dummy3',
    provider: 'local',
    name: 'dummy3',
    phone: 'dummy3',
    email: 'dummy3@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    password: 'test',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 400,
    balance: 500,
    invest: [],
    role: 'user',
    __v: 224,
  },
];

let dummySubscriptions = [
  {
    _id: '572a37d72ae95bf66b3e32d1',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: 'dummy1',
    following: 'test',
    amount: 1,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d2',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: 'dummy2',
    following: 'test',
    amount: 4,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d3',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: 'dummy3',
    following: 'test',
    amount: 4,
    __v: 0
  },
];

exports.setupData = () => {
  let saveUsers = dummyUsers.map((user) => {
    let userObj = new User(user);
    return userObj.save();
  }) || [];
  let saveSub = dummySubscriptions.map((sub) => {
    let subObj = new Subscription(sub);
    return subObj.save();
  }) || [];

  return Promise.all([...saveUsers, ...saveSub]);
};

let cleanupData = () => {
  let clearFeed = [];
  let clearUsers = dummyUsers.map((user) => {
    clearFeed.push(Feed.findOne({ user: user._id }).remove().exec());
    return User.findByIdAndRemove(user._id).exec();
  }) || [];
  let clearSub = dummySubscriptions.map(sub =>
    Subscription.findByIdAndRemove(sub._id).exec()
  ) || [];

  let dummies = dummyUsers.map(user => user._id);
  let clearNotifications = Notification.find({ forUser: { $in: dummies } }).remove();

  let clearUpvotes = Invest.find({ $or: [
    { investor: { $in: dummies } },
    { author: { $in: dummies } },
  ] }).remove();

  let clearPosts = Post.find({ title: 'Test post title' }).remove().exec() || null;
  let clearMeta = MetaPost.find({ title: 'Test post title' }).remove().exec() || null;
  let clearEarnings = Earnings.find({ user: { $in: dummies }}).remove().exec() || null;

  return Promise.all([
    ...clearUsers,
    ...clearSub,
    ...clearFeed,
    clearPosts,
    clearNotifications,
    clearUpvotes,
    clearMeta,
    clearEarnings
  ]);
};

exports.cleanupData = cleanupData;

exports.dummyUsers = dummyUsers;
