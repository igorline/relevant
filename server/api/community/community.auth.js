import request from 'request';
import { promisify } from 'util';
import { utils } from 'ethers';
import { getTokenBalance } from 'server/utils/contract';
import computePageRank from 'server/pagerank/pagerankCompute';
import Community from './community.model';

const requestAsync = promisify(request);

const getAssetsUrl = address =>
  `https://map-api-direct.foam.space:443/user/${address}/assets`;

const foamToken = '0x4946fcea7c692606e8908002e55a582af44ac121';

// const dummyAddress = '0x222861f16354020F62bBfa0A878B2F047a385576';
// const foamParams = {
//   auth: {
//     tokens: 100,
//     points: 5
//   }
// };
// TODO make these updatable
// async function initFoamParams() {
//   const foam = await Community.findOne({ slug: 'foam' });
//   if (!foam || foam.customParams) return;
//   await foam.setCustomParams(foamParams);
// }
// initFoamParams();

export async function checkCommunityAuth({ user, communityId, communityMember }) {
  const community = await Community.findOne({ _id: communityId });
  if (community.slug !== 'foam') return true;
  const { tokens, points } = community.customParams.auth;

  const { ethLogin } = user;

  if (!ethLogin)
    throw new Error(
      'You need to connect your 3Box profile to your account in order to post in this community.'
    );
  const res = await requestAsync({ url: getAssetsUrl(ethLogin) });
  const { verifiedPOIs, pendingPOIs } = JSON.parse(res.body);
  const totalPoints = verifiedPOIs + pendingPOIs || 0;

  if (!totalPoints || totalPoints < points) {
    throw new Error(
      `You can only post in this forum after you have added ${points} points of interest to the FOAM map.`
    );
  }
  const balanceWei = await getTokenBalance({
    address: ethLogin,
    tokenAddress: foamToken
  });

  const balance = utils.formatEther(balanceWei);
  if (balance < tokens)
    throw new Error(
      `You need to have at least ${tokens} FOAM tokens to post in this forum.`
    );

  if (!communityMember || !communityMember.role !== 'admin') {
    await community.join(user._id, 'admin');
    // do this async
    computePageRank({
      communityId: community._id,
      community: community.slug
    });
  }

  communityMember.customAdminWeight = totalPoints + Math.log(tokens + 1);
  await communityMember.save();
  return true;
}
