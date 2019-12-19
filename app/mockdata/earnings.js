export const earningPaidout = {
  community: 'relevant',
  communityId: null,
  createdAt: new Date('January 31, 2019 04:01:01 EST').toString(),
  earned: 0.0918203703714779,
  estimatedPostPayout: 0,
  post: '5c45483709a5b05cd0646d7c',
  shares: 0,
  source: 'post',
  stakedTokens: 0,
  status: 'paidout',
  totalPostShares: 0,
  type: 'coins',
  updatedAt: '2019-02-05T05:42:29.684Z',
  user: '5c4267177f81360b10b4b196',
  __v: 0,
  _id: '5c5922452de74dc9e56eeebb'
};

export const earningPending1 = {
  _id: '5c5086662de74dc9e5f61b66',
  post: '5c3d07d0348c61cc78023449',
  user: '5c4267177f81360b10b4b196',
  __v: 0,
  community: 'relevant',
  communityId: '5ba92052a7c7a539ed46d76f',
  status: 'pending',
  type: 'coins',
  earned: 0,
  shares: 10,
  estimatedPostPayout: 600,
  totalPostShares: 100,
  stakedTokens: 60,
  source: 'post'
};

export const earningPending2 = {
  _id: '5c50866 42de74dc9e5f61b4d',
  post: '5c2ea2b7cdf48233c35f10cd',
  user: '5c4267177f81360b10b4b196',
  __v: 0,
  community: 'relevant',
  communityId: '5ba92052a7c7a539ed46d76f',
  status: 'pending',
  type: 'coins',
  earned: 0,
  shares: 10,
  estimatedPostPayout: 600,
  totalPostShares: 100,
  stakedTokens: 40,
  source: 'post'
};

export const earnings = {
  list: ['5c5086662de74dc9e5f61b66', '5c5086642de74dc9e5f61b4d'],
  entities: {
    '5c5086642de74dc9e5f61b4d': earningPending2,
    '5c5086662de74dc9e5f61b66': earningPending1
  },
  pending: ['5c5086662de74dc9e5f61b66', '5c5086642de74dc9e5f61b4d']
};
