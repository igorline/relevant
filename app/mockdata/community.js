export const relevant = {
  _id: 'c00000000000000000000001',
  name: 'Relevant',
  slug: 'relevant',
  image: 'https://relevant-image.s3.amazonaws.com/9fgwyrd05_rL.jpg',
  description:
    'A community for curating and discussing links related to critical analysis of #technology, #society and #culture.',
  maxPostRank: 0.07075576196523553,
  maxUserRank: 0.16740002478323354,
  numberOfElements: 208,
  memberCount: 60,
  lastRewardFundUpdate: new Date(),
  postCount: 6,
  topPostShares: 1000,
  currentShares: 200,
  rewardFund: 0,
  currentPosts: 0,
  topics: ['technology', 'society', 'culture', 'politics', 'altwoke'],
  channels: [],
  betEnabled: true
};

export const crypto = {
  _id: 'c00000000000000000000002',
  name: 'Crypto',
  slug: 'crypto',
  image: '',
  description: 'Discussion of blockchain tech and ecosystem',
  rewardFund: 100 * 1e18,
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
  channels: [],
  betEnabled: true
};

export const brandNew = {
  _id: 'c00000000000000000000003',
  name: 'New Community',
  slug: 'imnew',
  image: '',
  description: 'Discussion of blockchain tech and ecosystem',
  lastRewardFundUpdate: new Date(),
  topics: ['co community topic'],
  channels: [],
  superAdmins: ['alice'],
  admins: ['alice']
};

export const allCommunities = [relevant, crypto];

export const community = {
  communities: {
    relevant,
    crypto
  },
  userMemberships: [],
  userCommunities: [],
  list: ['relevant', 'crypto'],
  active: 'relevant'
};
