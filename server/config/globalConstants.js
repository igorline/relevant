const HOURS = 60 * 60 * 1000;
const DAYS = HOURS * 24;
export const PAYOUT_FREQUENCY = 1 * HOURS; // how often we compute payouts
const PAYOUT_FREQUENCY_FRACTION = 1 / (365 * 24); // fraction of year
const YEARLY_INFLATION = 0.1; // 10%
export const INTERVAL_INFLAITION =
  (1 + YEARLY_INFLATION) ** PAYOUT_FREQUENCY_FRACTION - 1;
export const INIT_COIN = 1000000;
export const SHARE_DECAY = 6 * DAYS; // time it takes to decay payout post shares

export const TWITTER_DECAY = 12 * HOURS; // time it takes to decay payout post shares

export const PAYOUT_TIME = 3 * DAYS; // time it takes for post to pay out
export const VOTE_COST_RATIO = 0.07; // votes cost 7% of user balance
export const NEW_USER_COINS = 20; // amount of coins new users get

export const SLOPE = 1 / 1; // slope of bonding curve for posts
export const EXPONENT = 1; // exponent for bonding curve price formula
export const POWER_REGEN_INTERVAL = 24 * 60 * 60 * 1000; // 1 day to fully regenerate vote power

export const RELEVANCE_DECAY = 90 * DAYS; // half life of relevance
export const MINIMUM_RANK = 1; // minimum rank to be considered for rewards

export const REP_CUTOFF = 2; // number of years before we ignore votes
