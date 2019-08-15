const User = require('../api/user/user.model');
const Subscription = require('../api/subscription/subscription.model');
const Post = require('../api/post/post.model');
const Feed = require('../api/feed/feed.model');
const Notification = require('../api/notification/notification.model');
const Invest = require('../api/invest/invest.model');
const Earnings = require('../api/earnings/earnings.model');
const Relevance = require('../api/relevance/relevance.model');
const Community = require('../api/community/community.model').default;
const PostData = require('../api/post/postData.model.js');

const Eth = require('../utils/ethereum');

const testUserId = '5c4267177f81360b10b4b196';

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
  }
];

export const dummyUsers = [
  {
    _id: '572a37d72ae95bf66b3e32d1',
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
    _id: '572a37d72ae95bf66b3e32d2',
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
    _id: '572a37d72ae95bf66b3e32d3',
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
  }
];

const dummySubscriptions = [
  {
    _id: '572a37d72ae95bf66b3e32d1',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '572a37d72ae95bf66b3e32d1',
    following: testUserId,
    amount: 1,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d2',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '572a37d72ae95bf66b3e32d2',
    following: testUserId,
    amount: 4,
    __v: 0
  },
  {
    _id: '572a37d72ae95bf66b3e32d3',
    updatedAt: '2016-05-16T16:16:21.340Z',
    createdAt: '2016-05-04T17:56:39.263Z',
    follower: '572a37d72ae95bf66b3e32d3',
    following: testUserId,
    amount: 4,
    __v: 0
  }
];

export async function setupData(communities = []) {
  const saveUsers =
    dummyUsers.map(async user => {
      user = new User(user);
      user = await user.save();
      const joined = communities.map(async community => {
        const c = await Community.findOne({ slug: community });

        // create an upvote from test so we have some relevance
        const vote = new Invest({
          investor: testUserId,
          author: user._id,
          amount: 10,
          ownPost: false,
          communityId: c._id
        });
        await vote.save();

        return c.join(user._id);
      });

      await Promise.all(joined);
    }) || [];
  const saveSub =
    dummySubscriptions.map(sub => {
      const subObj = new Subscription(sub);
      return subObj.save();
    }) || [];

  return Promise.all([...saveUsers, ...saveSub]);
}

export async function cleanupData() {
  const clearFeed = [];
  const clearUsers =
    dummyUsers.map(async user => {
      try {
        clearFeed.push(
          Feed.findOne({ user: user._id })
          .remove()
          .exec()
        );
        user = await User.findOne({ _id: user._id });
        return user && user.remove();
      } catch (err) {
        throw err;
      }
    }) || [];
  const clearSub =
    dummySubscriptions.map(sub => Subscription.findByIdAndRemove(sub._id).exec()) || [];

  const dummies = dummyUsers.map(user => user._id);
  const clearNotifications = Notification.find({ forUser: { $in: dummies } }).remove();

  const clearUpvotes = Invest.find({
    $or: [{ investor: { $in: dummies } }, { author: { $in: dummies } }]
  }).remove();

  const posts = await Post.find({ body: 'Hotties' });
  const clearPostData = await PostData.deleteMany({
    post: { $in: posts.map(p => p._id) }
  }).exec();

  // Have to do this in order to trigger remove hooks;
  const clearPosts = posts.map(async post => post.remove());
  const clearEarnings =
    Earnings.find({ user: { $in: dummies } })
    .remove()
    .exec() || null;
  const clearRelevance =
    Relevance.find({ user: { $in: dummies } })
    .remove()
    .exec() || null;

  let clearCommunity = await Community.find({
    slug: { $in: ['test_community1', 'test_community2', 'test_community3'] }
  });
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
    ...clearCommunity,
    clearPostData
  ]);
}

export async function initEth() {
  const balances = testAccounts.map(async (acc, i) => {
    const balance = await Eth.getBalance(acc.address);
    if (balance === 0) {
      return Eth.buyTokens(acc.address, acc.key, i + 1);
    }
    return balance;
  });
  return Promise.all(balances);
}
