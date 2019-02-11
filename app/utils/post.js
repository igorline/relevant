export const URL_REGEX = new RegExp(
  // eslint-disable-next-line
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/
);

export function computePayout(postData, community) {
  if (!community || !postData || postData.parentPost) return null;
  postData.payoutShare = postData.pagerank / (community.topPostShares || 1);
  postData.payout = community.rewardFund * postData.payoutShare;
  return postData.payout / 10 ** 18;
}
