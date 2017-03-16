let User = require('../api/user/user.model');
let Subscription = require('../api/subscription/subscription.model');
let Post = require('../api/post/post.model');
let Feed = require('../api/feed/feed.model');
let Notification = require('../api/notification/notification.model');

let dummyUsers = [
  {
    _id: '5706ef322170009d5be58be5',
    provider: 'local',
    name: 'dummy1',
    phone: 'dummy1',
    email: 'dummy1@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    hashedPassword: 'DyTMC4msmlo7CBzbFNHGc105N3MRy94Ac+e0o9hAoYQ+nrPsTFqTwAnR3ZYudhpJGgAltUtcfi7QKCNa/GuktA==',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 7.158883083359672,
    balance: 5000,
    posts: [
      '5735fd75bcebaca8eebdf82f'
    ],
    invest: [],
    role: 'user',
    __v: 224,
    feed: []
  },
  {
    _id: '5706ef322170009d5be58be6',
    provider: 'local',
    name: 'dummy2',
    phone: 'dummy2',
    email: 'dummy2@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    hashedPassword: 'DyTMC4msmlo7CBzbFNHGc105N3MRy94Ac+e0o9hAoYQ+nrPsTFqTwAnR3ZYudhpJGgAltUtcfi7QKCNa/GuktA==',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 7.158883083359672,
    balance: 5000,
    posts: [
      '5735fd75bcebaca8eebdf82f'
    ],
    invest: [],
    role: 'user',
    __v: 224,
    feed: []
  },
  {
    _id: '5706ef322170009d5be58be7',
    provider: 'local',
    name: 'dummy3',
    phone: 'dummy3',
    email: 'dummy3@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    hashedPassword: 'DyTMC4msmlo7CBzbFNHGc105N3MRy94Ac+e0o9hAoYQ+nrPsTFqTwAnR3ZYudhpJGgAltUtcfi7QKCNa/GuktA==',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 7.158883083359672,
    balance: 5000,
    posts: [
      '5735fd75bcebaca8eebdf82f'
    ],
    invest: [],
    role: 'user',
    __v: 224,
    feed: []
  },
];

let dummySubscriptions = [
  {
    _id: '572a37d72ae95bf66b3e32d1',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '5706ef322170009d5be58be5',
    following: '5706ef322170009d5be58be4',
    amount: 1,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d2',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '5706ef322170009d5be58be6',
    following: '5706ef322170009d5be58be4',
    amount: 4,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d3',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '5706ef322170009d5be58be7',
    following: '5706ef322170009d5be58be4',
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

  let clearNotifications = User.findOne({ name: 'Admin' })
  .then(admin => Notification.find({ byUser: admin._id }).remove());

  let clearPosts = Post.findOne({ title: 'Test post title' }).remove().exec() || [];

  return Promise.all([
    ...clearUsers,
    ...clearSub,
    ...clearFeed,
    ...clearPosts,
    ...clearNotifications]);
};

exports.cleanupData = cleanupData;

exports.dummyUsers = dummyUsers;
