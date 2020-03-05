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

const foamParams = {
  auth: {
    tokens: 100,
    points: 5
  }
};

async function initFoamParams() {
  const foam = await Community.findOne({ slug: 'foam' });
  if (!foam || foam.customParams) return;
  await foam.setCustomParams(foamParams);
}

export async function checkAuthRoute(req, res, next) {
  try {
    const { user, communityMember } = req;
    const { communityId } = communityMember;
    await checkCommunityAuth({ user, communityId, communityMember });
    res.status(200).json({ OK: true });
  } catch (err) {
    next(err);
  }
}

export async function checkCommunityAuth({ user, communityId, communityMember }) {
  let community = await Community.findOne({ _id: communityId });
  if (community.slug !== 'foam') return true;
  if (!community.customParams) {
    community = await initFoamParams();
  }
  const { tokens, points } = community.customParams.auth;

  const { ethLogin } = user;
  // FOR TESTING ONLY
  // const ethLogin = dummyAddress;

  if (!ethLogin) {
    throw new Error(
      'You need to connect the Ethereum address you use with FOAM in order to post in this forum.\nYou can connect your address with Metamask via Wallet -> Connect Wallet.'
    );
  }
  const res = await requestAsync({ url: getAssetsUrl(ethLogin) });
  const { verifiedPOIs, pendingPOIs } = JSON.parse(res.body);
  const totalPoints = verifiedPOIs + pendingPOIs || 0;

  if (!totalPoints || totalPoints < points) {
    throw new Error(
      `You can only post in this forum only after you have:\n - added ${points} points of interest to the FOAM map\n - have a balance of at least ${tokens} FOAM tokens`
    );
  }
  const balanceWei = await getTokenBalance({
    address: ethLogin,
    tokenAddress: foamToken
  });

  const balance = utils.formatEther(balanceWei);
  if (balance < tokens)
    throw new Error(
      `You can only post in this forum only after you have:\n - added ${points} points of interest to the FOAM map\n - have a balance of at least ${tokens} FOAM tokens`
    );

  // if (!communityMember || !communityMember.role !== 'admin') {
  // await community.join(user._id, 'admin');
  if (!communityMember) {
    await community.join(user._id);
  }

  if (communityMember.pagerank === 0) {
    computePageRank({
      communityId: community._id,
      community: community.slug
    });
  }

  if (communityMember.defaultWeight !== totalPoints + Math.log(tokens + 1)) {
    communityMember.defaultWeight = totalPoints + Math.log(tokens + 1);
    // communityMember.customAdminWeight = totalPoints + Math.log(tokens + 1);
    await communityMember.save();
  }
  return true;
}
