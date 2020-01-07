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
    'handle'
  ).populate({
    path: 'user',
    select: 'handle',
    populate: {
      path: 'relevance',
      match: { communityId },
      select: 'pagerank pagerankRaw pagerankRawNeg'
    }
  });

  const comObj = await Community.findOne(
    { _id: communityId },
    'danglingConsumer negConsumer'
  );

  const votes = await getVotes(communityId);

  const personalization = {};
  admins.forEach(a => {
    if (!a.user) return;
    const userId = a.user._id;
    personalization[userId] = 1;
  });

  const { nodes, postNodes } = new Graph(votes, admins.map(a => a.user), comObj);

  heapUsed = process.memoryUsage().heapUsed;
  mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('Before PR - using ' + mb + 'MB of Heap.');
  debug && console.log('user query time ', (new Date().getTime() - now) / 1000 + 's');

  const scores = pagerank(nodes, {
    personalization,
    debug
  });

  heapUsed = process.memoryUsage().heapUsed;
  mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('After PR is using ' + mb + 'MB of Heap.');

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
