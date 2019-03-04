import { TOKEN_DECIMALS } from 'server/config/globalConstants';

export function computePostPayout(postData, community) {
  if (!community || !postData || postData.parentPost) return null;
  if (postData.pagerank < community.currentShares / (community.postCount || 1)) {
    return 0;
  }
  postData.payoutShare =
    postData.pagerank / (community.topPostShares + postData.pagerank || 1);
  postData.payout = community.rewardFund * postData.payoutShare;
  return postData.payout / TOKEN_DECIMALS;
}

export function computeUserPayout(earning) {
  if (earning.status === 'pending') {
    if (earning.totalPostShares === 0) return 0;
    let estimatedPayout = earning.estimatedPostPayout;
    if (estimatedPayout > 1e8) estimatedPayout /= TOKEN_DECIMALS;
    const payout = (estimatedPayout * earning.shares) / earning.totalPostShares;
    return payout;
  }
  if (earning.earned || earning.status === 'paidout') return earning.earned;
  return 0;
}
