export const HOURS = 60 * 60 * 1000;
export const DAYS = HOURS * 24;
export const PAYOUT_FREQUENCY = 1 * HOURS; // how often we compute payouts
export const PAYOUT_FREQUENCY_FRACTION = 1 / (365 * 24); // fraction of year
export const YEARLY_INFLATION = 0.1; // 10%
export const INTERVAL_INFLAITION =
  (1 + YEARLY_INFLATION) ** PAYOUT_FREQUENCY_FRACTION - 1;
export const INIT_COIN = 1000000;
export const SHARE_DECAY = 6 * DAYS; // time it takes to decay payout post shares

export const TWITTER_DECAY = 12 * HOURS; // time it takes to decay payout post shares

export const PAYOUT_TIME = 3 * DAYS; // time it takes for post to pay out
export const VOTE_COST_RATIO = 0.1; // votes cost 10% of user balance
// export const NEW_USER_COINS = 20; // amount of coins new users get

export const SLOPE = 1 / 1; // slope of bonding curve for posts
export const EXPONENT = 1; // exponent for bonding curve price formula
export const POWER_REGEN_INTERVAL = 24 * 60 * 60 * 1000; // 1 day to fully regenerate vote power

export const RELEVANCE_DECAY = 90 * DAYS; // half life of relevance
export const RELEVANCE_DECAY_POSTS = 90 * DAYS; // half life of relevance
export const REP_CUTOFF = 2; // number of years before we ignore votes for users
export const REP_CUTOFF_POSTS = 90 * DAYS; // time before we ignore votes for posts

export const MINIMUM_RANK = 1; // minimum rank to be considered for rewards

export const PUBLIC_LINK_REWARD = 5; // amount of tokens you get for public referral
export const REFERRAL_REWARD = 20; // amount of tokens awarded both the referrer and referee
export const TWITTER_REWARD = 20; // amount of tokens awarded for connecting twitter
export const EMAIL_REWARD = 20; // amount of tokens awarded for connecting email

// TODO: Deprecate CASHOUT_LIMIT
export const CASHOUT_LIMIT = 0; // amount of tokens one needs to earn to cash out
export const CASHOUT_MAX = 1000;

export const REDDIT_REWARD = 5;
export const TOKEN_DECIMALS = 1e18;

export const totalAllowedInvites = pagerank => {
  if (pagerank < 1) return 0;
  if (pagerank < 3) return 1;
  if (pagerank < 5) return 2;
  if (pagerank < 10) return 3;
  if (pagerank < 20) return 8;
  if (pagerank < 40) return 13;
  if (pagerank < 60) return 23;
  if (pagerank < 80) return 33;
  return 100;
};

export const MAX_AIRDROP = 300;

export const getRewardForType = type => {
  switch (type) {
    case 'reddit':
      return REDDIT_REWARD;
    case 'email':
      return EMAIL_REWARD;
    case 'twitter':
      return TWITTER_REWARD;
    case 'referral':
      return REFERRAL_REWARD;
    case 'referredBy':
      return REFERRAL_REWARD;
    case 'publicLink':
    case 'publicInvite':
      return PUBLIC_LINK_REWARD;
    default:
      return 0;
  }
};

export const newUserCoins = user => {
  let reward = 0;
  if (user.email && user.confirmed) reward = EMAIL_REWARD;
  if (user.twitterId) reward = EMAIL_REWARD + TWITTER_REWARD;
  return reward;
};

export const BANNED_COMMUNITY_SLUGS = [
  'admin',
  'user',
  'channel',
  'home',
  'auth',
  'profile',
  'communities',
  'subscriptions',
  'graphql'
];

export const BANNED_USER_HANDLES = [
  ...BANNED_COMMUNITY_SLUGS,
  'everyone',
  'group',
  'all',
  'invite'
];

export const userVotePower = pagerank => Math.round(Math.sqrt(1 + pagerank * 4));
