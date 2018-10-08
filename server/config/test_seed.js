let User = require('../api/user/user.model');
let Subscription = require('../api/subscription/subscription.model');
let Post = require('../api/post/post.model');
let Feed = require('../api/feed/feed.model');
let Notification = require('../api/notification/notification.model');
let Invest = require('../api/invest/invest.model');
let Earnings = require('../api/earnings/earnings.model');
let Relevance = require('../api/relevance/relevance.model');
let Community = require('../api/community/community.model').default;

let Eth = require('../utils/ethereum');

export const testAccounts = [
  {
    address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    key: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
  },
  {
    address: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
    key: 'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
  },
  {
    address: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    key: '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1'
  },
];

export const dummyUsers = [
  {
    _id: 'dummy1',
    handle: 'dummy1',
    provider: 'local',
    name: 'dummy1',
    phone: 'dummy1',
    email: 'dummy1@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    password: 'test',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 10,
    balance: 500,
    role: 'user',
    __v: 224,
    ethAddress: [testAccounts[0].address]
  },
  {
    _id: 'dummy2',
    handle: 'dummy2',
    provider: 'local',
    name: 'dummy2',
    phone: 'dummy2',
    email: 'dummy2@gmail.com',
    image: 'https://relevant-images.s3.amazonaws.com/c4kdpddkj_.gif',
    password: 'test',
    salt: '1juLhuAPx0BY9ZrWz2B7Vg==',
    relevance: 100,
    balance: 500,
    role: 'user',
    __v: 224,
    ethAddress: [testAccounts[1].address]
  },
  {
    _id: 'dummy3',
    handle: 'dummy3',
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
    ethAddress: [testAccounts[2].address]
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

export async function setupData(communities) {
  let saveUsers = dummyUsers.map(async user => {
    user = new User(user);
    user = await user.save();
    let joined = communities.map(async community => {
      let c = await Community.findOne({ slug: community });
      return c.join(user._id);
    });
    await Promise.all(joined);
  }) || [];
  let saveSub = dummySubscriptions.map((sub) => {
    let subObj = new Subscription(sub);
    return subObj.save();
  }) || [];

  return Promise.all([...saveUsers, ...saveSub]);
}

export async function cleanupData() {
  console.log('CLEAN UP DATA');
  let clearFeed = [];
  let clearUsers = dummyUsers.map(async user => {
    try {
      clearFeed.push(Feed.findOne({ user: user._id }).remove().exec());
      user = await User.findOne({ _id: user._id });
      return user && user.remove();
    } catch (err) {
      console.log(err);
    }
  }) || [];
  let clearSub = dummySubscriptions.map(sub =>
    Subscription.findByIdAndRemove(sub._id).exec()
  ) || [];

  let dummies = dummyUsers.map(user => user._id);
  let clearNotifications = Notification.find({ forUser: { $in: dummies } }).remove();

  let clearUpvotes = Invest.find({
    $or: [
      { investor: { $in: dummies } },
      { author: { $in: dummies } },
    ]
  }).remove();

  let posts = await Post.find({ body: 'Hotties' });
  // Have to do this in order to trigger remove hooks;
  let clearPosts = posts.map(async post => post.remove());
  let clearEarnings = Earnings.find({ user: { $in: dummies } }).remove().exec() || null;
  let clearRelevance = Relevance.find({ user: { $in: dummies } }).remove().exec() || null;

  let clearCommunity = await Community.find({ slug: { $in: ['test_community1', 'test_community2', 'test_community3' ] } });
  clearCommunity = clearCommunity.map(async c => c.remove());
  // let clearCommunityFeed = CommunityFeed.remove({})

  return Promise.all([
    ...clearUsers,
    ...clearSub,
    ...clearFeed,
    ...clearPosts,
    clearNotifications,
    clearUpvotes,
    clearEarnings,
    clearRelevance,
    ...clearCommunity
  ]);
}

export async function initEth() {
  let balances = testAccounts.map(async (acc, i) => {
    let balance = await Eth.getBalance(acc.address);
    if (balance === 0) {
      return Eth.buyTokens(acc.address, acc.key, i + 1);
    }
    return balance;
  });
  return Promise.all(balances);
}

