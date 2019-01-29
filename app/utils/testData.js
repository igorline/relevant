
export const user1 = {
  _id: 111,
  image: 'userImage1.jpg',
  handle: 'handle1',
  name: 'Name1',
  relevance: { pagerank: 11 },
  balance: 111
};

export const user2 = {
  _id: 222,
  image: 'userImage2.jpg',
  handle: 'handle2',
  name: 'Name2',
  relevance: { pagerank: 22 },
  balance: 222
};


export const post1 = {
  _id: 1111,
  user: 111,
  title: 'postTitle',
  embeddedUser: user1,
  tags: ['tag11', 'tag12'],
  body: 'awesome post #1!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img1.jpg', url: 'https://example.com/testPost1', domain: 'link.domain1', title: 'postTitle1' },
  type: 'post',
};

export const post2 = {
  _id: 2222,
  user: 2222,
  title: 'postTitle',
  embeddedUser: user1,
  tags: ['tag21', 'tag22'],
  body: 'awesome post #2!',
  postDate: new Date(),
  data: { pagerank: 45, payout: 18 * (10 ** 18) },
  link: { image: 'link_img2.jpg', url: 'https://example.com/testPost2', domain: 'link.domain2', title: 'postTitle2' },
  parentPost: 1111,
  type: 'comment',
};


export const usersState = {
  users: { [user1._id]: user1, [user2._id]: user2 },
  handleToId: { [user1.handle]: user1._id, [user2.handle]: user2._id }
};

export const postsState = {
  posts: { 234: post1 }
};

export const activity = {
  totlaUsers: 3,
  amount: 10,
  byUser: user2, // TODO create user prop type validation
  post: post2, // TODO create post prop type validation
  type: 'upvote',
  createdAt: new Date()
};

export const auth = {
  community: 'testCommunity',
  user: user1,
  isAuthenticated: true
};

export const earnings = {
  list: [
    null,
    null
  ],
  entities: {
    '5c5086642de74dc9e5f61b4d': {
      _id: '5c50866 42de74dc9e5f61b4d',
      post: '5c2ea2b7cdf48233c35f10cd',
      user: '5c4267177f81360b10b4b196',
      __v: 0,
      community: 'relevant',
      communityId: '5ba92052a7c7a539ed46d76f',
      createdAt: '2019-01-29T16:59:15.005Z',
      status: 'pending',
      updatedAt: '2019-01-29T16:59:15.005Z',
      type: 'coins',
      earned: 0,
      shares: 6.558015775658454,
      stakedTokens: 36.98481240654963,
      source: 'post'
    },
    '5c5086662de74dc9e5f61b66': {
      _id: '5c5086662de74dc9e5f61b66',
      post: '5c3d07d0348c61cc78023449',
      user: '5c4267177f81360b10b4b196',
      __v: 0,
      community: 'relevant',
      communityId: '5ba92052a7c7a539ed46d76f',
      createdAt: '2019-01-29T16:59:17.352Z',
      status: 'pending',
      updatedAt: '2019-01-29T16:59:17.352Z',
      type: 'coins',
      earned: 0,
      shares: 6.494270483877456,
      stakedTokens: 36.98481240654963,
      source: 'post'
    }
  },
  pending: [
    '5c5086662de74dc9e5f61b66',
    '5c5086642de74dc9e5f61b4d',
  ]
};

export const community = {
  communities: {
    relevant: {
      _id: '5ba92052a7c7a539ed46d76f',
      updatedAt: '2019-01-23T21:27:34.437Z',
      createdAt: '2018-09-24T17:35:14.548Z',
      name: 'Relevant',
      slug: 'relevant',
      image: 'https://relevant-image.s3.amazonaws.com/9fgwyrd05_rL.jpg',
      description: 'A community for curating and discussing links related to critical analysis of #technology, #society and #culture.',
      __v: 0,
      maxPostRank: 0.07075576196523553,
      maxUserRank: 0.16740002478323354,
      numberOfElements: 208,
      memberCount: 60,
      twitterCount: 0,
      avgTwitterScore: 0,
      lastRewardFundUpdate: '2019-01-21T05:57:14.594Z',
      postCount: 5.9961398561319355,
      topPostShares: 795.4000000000002,
      currentShares: 174.42311215150642,
      rewardFund: 0,
      currentPosts: 0,
      topics: [
        'technology',
        'society',
        'culture',
        'politics',
        'altwoke'
      ],
      channels: []
    },
    crypto: {
      _id: '5bb7b029cad8c6f342074773',
      updatedAt: '2019-01-21T06:41:38.394Z',
      createdAt: '2018-10-05T18:40:41.241Z',
      name: 'Crypto',
      slug: 'crypto',
      image: '',
      description: 'Discussion of blockchain tech and ecosystem',
      __v: 0,
      maxPostRank: 0.07589951187785565,
      maxUserRank: 0.22774693637225513,
      numberOfElements: 18,
      memberCount: 11,
      twitterCount: 0,
      avgTwitterScore: 0,
      lastRewardFundUpdate: '2019-01-21T05:57:15.119Z',
      postCount: 2.998875875791273,
      topPostShares: 3062.1500000000005,
      currentShares: 299.8875875791273,
      rewardFund: 0,
      currentPosts: 0,
      topics: [
        'governance',
        'layer1',
        'layer2',
        'whiter papers',
        'scaling',
        'projects',
        'reputation',
        'curation markets'
      ],
      channels: []
    }
  },
  list: [
    'relevant',
    'crypto'
  ],
  active: 'relevant'
};
