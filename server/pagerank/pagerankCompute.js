import Invest from 'server/api/invest/invest.model';
import CommunityMember from 'server/api/community/community.member.model';
import Community from 'server/api/community/community.model';
import { REP_CUTOFF } from 'server/config/globalConstants';
import pagerank from './pagerank';
import Graph from './graph';
import { handleResults } from './handleResults';

/* eslint no-console: 0 */

export default async function computePageRank(params) {
  const { debug, communityId, community } = params;

  if (!community) throw new Error('missing community name');

  let { heapUsed } = process.memoryUsage();
  let mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('Init PR is using ' + mb + 'MB of Heap.');

  const now = new Date();

  const admins = await CommunityMember.find(
    { role: 'admin', communityId },
    'embeddedUser defaultWeight customAdminWeight pagerank pagerankRaw pagerankRawNeg'
  );

  const usersWithDefaultWeight = await CommunityMember.find(
    { role: 'user', communityId, defaultWeight: { $gt: 0 } },
    'embeddedUser customAdminWeight defaultWeight pagerank pagerankRaw pagerankRawNeg'
  );

  const comObj = await Community.findOne(
    { _id: communityId },
    'danglingConsumer negConsumer'
  );

  const votes = await getVotes(communityId);

  const personalization = {};

  const tranformedAdmins = admins.map(a => {
    const userId = a.embeddedUser._id;
    personalization[userId] = a.customAdminWeight || 1;
    return { ...a.embeddedUser, relevance: a };
  });

  const { nodes, postNodes } = new Graph({
    votes,
    admins: tranformedAdmins,
    community: comObj,
    usersWithDefault: usersWithDefaultWeight.map(u => ({
      ...u.embeddedUser,
      relevance: u
    }))
  });

  if (debug) {
    heapUsed = process.memoryUsage().heapUsed;
    mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Before PR - using ' + mb + 'MB of Heap.');
    console.log('user query time ', (new Date().getTime() - now) / 1000 + 's');
  }

  const scores = pagerank(nodes, {
    personalization,
    debug
  });

  if (debug) {
    heapUsed = process.memoryUsage().heapUsed;
    mb = Math.round((100 * heapUsed) / 1048576) / 100;
    debug && console.log('After PR is using ' + mb + 'MB of Heap.');
  }
  await handleResults({ scores, nodes, communityId, debug, postNodes });
}

async function getVotes(communityId) {
  // only look at votes up to a REP_CUTOFF years ago
  const timeLimit = new Date().setFullYear(new Date().getFullYear() - REP_CUTOFF);

  return Invest.find({
    communityId,
    createdAt: { $gt: timeLimit },
    ownPost: { $ne: true },
    investor: { $exists: true }
  })
    .populate({
      path: 'investor',
      select: 'handle',
      populate: {
        path: 'relevance',
        match: { communityId },
        select: 'pagerank pagerankRaw pagerankRawNeg'
      }
    })
    .populate({
      path: 'author',
      select: 'handle',
      populate: {
        path: 'relevance',
        match: { communityId },
        select: 'pagerank pagerankRaw pagerankRawNeg'
      }
    })
    .populate({
      path: 'post',
      select: 'title',
      populate: {
        path: 'data',
        select: 'pagerank pagerankRaw pagerankRawNeg body needsRankUpdate'
      }
    });
}
