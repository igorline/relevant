import { TOKEN_DECIMALS } from 'server/config/globalConstants';

export function computePostPayout(postData, community) {
  if (!community || !postData || postData.parentPost) return null;
  postData.payoutShare = postData.pagerank / (community.topPostShares || 1);
  postData.payout = community.rewardFund * postData.payoutShare;
  return postData.payout / TOKEN_DECIMALS;
}

export function computeUserPayout(earning) {
  if (earning.status === 'pending') {
    let estimatedPayout = earning.estimatedPostPayout;
    if (estimatedPayout > 1e8) estimatedPayout /= TOKEN_DECIMALS;
    const payout = (estimatedPayout * earning.shares) / earning.totalPostShares;
    return payout;
  }
  if (earning.earned || earning.status === 'paidout') return earning.earned;
  return 0;
}
