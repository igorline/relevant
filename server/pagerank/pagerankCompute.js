import queue from 'queue';
import Invest from 'server/api/invest/invest.model';
import CommunityMember from 'server/api/community/community.member.model';
import Post from 'server/api/post/post.model';
import PostData from 'server/api/post/postData.model';
import Relevance from 'server/api/relevance/relevance.model';
import { RELEVANCE_DECAY, REP_CUTOFF } from 'server/config/globalConstants';
import Community from 'server/api/community/community.model';
import pagerank from './pagerank';

const q = queue({ concurrency: 10 });

/* eslint no-console: 0 */

// compute relevance using pagerank
export default async function computePageRank(params) {
  const { author, post, debug, communityId, community, fast } = params;

  if (!community) throw new Error('missing community name');

  let { heapUsed } = process.memoryUsage();
  let mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('Init PR is using ' + mb + 'MB of Heap.');
  // let users = await User.find({})
  // .populate({ path: 'relevance', match: { communityId, global: true } });

  const now = new Date();

  const admins = await CommunityMember.find({ role: 'admin', communityId }).populate({
    path: 'user',
    select: 'relevance',
    populate: {
      path: 'relevance',
      match: { communityId, global: true },
      select: 'pagerank pagerankRaw relevance'
    }
  });

  const rankedNodes = {};
  const negativeWeights = {};
  const originalUsers = {};
  const originalPosts = {};
  const rankedPosts = {};
  const nstart = {};

  const votes = await getVotes(communityId);

  votes.forEach(vote => {
    const user = vote.investor;
    if (!user) return null;
    const postAuthor = vote.author;

    if (postAuthor && user._id.equals(postAuthor._id)) {
      return null;
    }

    const { post: postObj } = vote;

    const postId = postObj
      ? vote.amount < 0
        ? postObj._id + '__neg'
        : postObj._id
      : null;

    if (postObj && !originalPosts[postId]) {
      originalPosts[postId] = postObj._id;
    }
    if (postAuthor && !originalUsers[postAuthor._id]) {
      originalUsers[postAuthor._id] = postAuthor;
    }

    return processUpvote({
      rankedNodes,
      rankedPosts,
      nstart,
      upvote: vote,
      user,
      now
    });
  });

  const personalization = {};
  admins.forEach(a => {
    if (!a.user) return;
    const userId = a.user._id;
    if (!originalUsers[userId]) originalUsers[userId] = a.user;

    if (!rankedNodes[userId]) rankedNodes[userId] = {};

    personalization[userId] = 1;
    if (!nstart[userId]) {
      nstart[userId] = a.user.relevance ? Math.max(a.user.relevance.pagerankRaw, 0) : 0;
    }
  });

  // TODO prune users with no votes
  Object.keys(rankedNodes).forEach(u => {
    if (!originalUsers[u] && !originalPosts[u]) {
      return delete rankedNodes[u];
    }
    return Object.keys(rankedNodes[u]).forEach(name => {
      // fills any missing names in list
      if (!rankedNodes[name]) {
        if (!originalUsers[name]) {
          delete rankedNodes[u][name];
        } else {
          const user = originalUsers[name];
          nstart[name] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
          rankedNodes[name] = {};
        }
      }
    });
  });

  heapUsed = process.memoryUsage().heapUsed;
  mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('Before PR - using ' + mb + 'MB of Heap.');

  debug && console.log('user query time ', (new Date().getTime() - now) / 1000 + 's');

  const scores = pagerank(rankedNodes, {
    alpha: 0.85,
    users: originalUsers,
    personalization,
    negativeWeights,
    nstart,
    fast,
    debug
  });

  heapUsed = process.memoryUsage().heapUsed;
  mb = Math.round((100 * heapUsed) / 1048576) / 100;
  debug && console.log('After PR is using ' + mb + 'MB of Heap.');

  let max = 0;
  let secondMax = 0;
  const min = 0;
  let maxPost = 0;
  const minPost = 0;

  let array = [];
  Object.keys(scores).forEach(id => {
    let postNode;
    if (rankedPosts[id]) {
      postNode = rankedPosts[id];
    }

    const u = scores[id] || 0;
    if (postNode) maxPost = Math.max(u.rank, maxPost);
    else {
      secondMax = Math.max(secondMax, Math.min(u.rank, max));
      max = Math.max(u.rank, max);
    }

    array.push({
      id,
      rank: u.rank,
      type: postNode ? 'post' : 'user',
      title: postNode ? postNode.title : null,
      handle: originalUsers[id] && originalUsers[id].handle,
      degree: u.degree
    });
  });

  const N = array.length;

  await Community.findOneAndUpdate(
    { _id: communityId },
    { maxPostRank: maxPost || 50, maxUserRank: secondMax || 50, numberOfElements: N }
  );

  array = mergeNegativeNodes(array);
  array = array.sort((a, b) => a.rank - b.rank);

  if (author) {
    let u = array.find(el => el.id.toString() === author._id.toString());
    u = await updateItemRank({
      min,
      max,
      secondMax,
      minPost,
      maxPost,
      u,
      N,
      debug,
      communityId,
      community
    });
    author.relevance.pagerank = u.pagerank;
  }

  if (post) {
    let u = array.find(el => el.id.toString() === post._id.toString());
    if (!u) u = { id: post._id, rank: 0, relevance: 0, type: 'post' };
    u = await updateItemRank({
      min,
      max,
      minPost,
      maxPost,
      u,
      N,
      debug,
      communityId,
      community
    });
    post.data.pagerank = u.pagerank;
    post.pagerank = u.pagerank;
  }

  array.forEach(async u => {
    q.push(async cb => {
      await updateItemRank({
        min,
        max,
        secondMax,
        minPost,
        maxPost,
        u,
        N,
        debug,
        communityId,
        community
      });

      cb();
    });
  });

  return new Promise((resolve, reject) =>
    q.start(err => {
      if (err) reject(err);
      resolve({ author, post });
    })
  );
}

function mergeNegativeNodes(array) {
  const newArray = [];
  array.forEach(node => {
    if (node.id.match('__neg')) return null;
    const negativeNode = array.find(
      n => n.id.match('__neg') && n.id.replace('__neg', '') === node.id
    );
    node.rankNeg = negativeNode ? negativeNode.rank : 0;
    return newArray.push(node);
  });
  return newArray;
}

async function updateItemRank(props) {
  const { secondMax, maxPost, u, N, debug, communityId, community } = props;
  let { min, minPost } = props;
  min = 0;
  minPost = 0;
  let rank =
    Math.min(
      99,
      (100 * Math.log(N * (u.rank - min) + 1)) / Math.log(N * (secondMax - min) + 1)
    ) || 0;

  const postRank =
    (100 * Math.log(N * (u.rank - minPost) + 1)) /
      Math.log(N * (maxPost - minPost) + 1) || 0;

  const postRankNeg =
    (100 * Math.log(N * (u.rankNeg - minPost) + 1)) /
      Math.log(N * (maxPost - minPost) + 1) || 0;

  if (u.type === 'post') {
    rank = postRank - postRankNeg;
  }

  rank = rank.toFixed(2);

  const voteWeight =
    (100 * Math.log(N * (u.rank / (1 + u.degree) - min) + 1)) /
      Math.log(N * (secondMax - min) + 1) || 0;

  if (debug && u.type === 'user') {
    // if (debug && u.type !== 'post') {
    console.log('name: ', u.handle || u.title || u.id, u.id);
    console.log('PageRank ', rank, voteWeight, u.degree);
    console.log('-----');
  }

  if (u.type === 'user') {
    if (Number.isNaN(rank)) return null;

    const user = await CommunityMember.findOneAndUpdate(
      { user: u.id, communityId },
      { reputation: rank, degree: u.degree, pagerank: rank, pagerankRaw: u.rank },
      {
        // new: true,
        upsert: true
      }
    );

    await Relevance.findOneAndUpdate(
      { user: u.id, communityId, global: true },
      { pagerank: rank, pagerankRaw: u.rank, community },
      {
        new: true,
        upsert: true,
        fields: 'pagerank pagerankRaw user rank relevance communityId community'
      }
    );
    return user;
  }
  if (u.type === 'post') {
    if (Number.isNaN(rank)) {
      return null;
    }
    let post = await Post.findOneAndUpdate(
      { _id: u.id },
      { pagerank: rank },
      {
        new: true,
        fields: 'pagerank title rank relevance parentPost communityId postDate'
      }
    );
    const postData = await PostData.findOneAndUpdate(
      { post: u.id, communityId },
      { pagerank: rank, pagerankRaw: u.rank, pagerankRawNeg: u.rankNeg },
      {
        new: true,
        fields:
          'pagerank pagerankRaw pagerankRawNeg post rank relevance postDate communityId needsRankUpdate'
      }
    );

    if (postData && postData.needsRankUpdate) {
      postData.needsRankUpdate = false;
      post.data = postData;
      post = await post.updateRank({ communityId });
    }

    return post.data || postData;
  }
  return null;
}

function processUpvote(params) {
  const { rankedNodes, rankedPosts, nstart, upvote, user, now } = params;
  const { post, author, amount } = upvote;
  const authorId = author ? author._id : null;
  const userId = user._id;

  let a = amount;
  if (!a) a = 0;

  // time discount (RELEVANCE_DECAY month half-life)
  const t = now.getTime() - upvote.createdAt.getTime();
  a *= (1 / 2) ** (t / RELEVANCE_DECAY);

  if (!rankedNodes[userId]) {
    nstart[userId] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
    rankedNodes[userId] = { handle: user.handle };
  }

  if (authorId && !rankedNodes[userId][authorId]) {
    rankedNodes[userId][authorId] = {
      weight: 0,
      negative: 0,
      total: 0
    };
  }

  if (a < 0) {
    const downvote = true;
    const postId = createPostNode({
      post,
      rankedNodes,
      rankedPosts,
      nstart,
      user,
      downvote
    });

    if (authorId) rankedNodes[userId][authorId].negative += -a;
    // here we use a different node to track post downvotes
    if (post) {
      rankedNodes[userId][postId].weight += -a;
      rankedNodes[userId][postId].total += -a;
    }
  } else {
    if (authorId) rankedNodes[userId][authorId].weight += a;
    const postId = createPostNode({ post, rankedNodes, rankedPosts, nstart, user });
    if (post) {
      rankedNodes[userId][postId].weight += a;
      rankedNodes[userId][postId].total += Math.abs(a);
    }
  }
  if (authorId) rankedNodes[userId][authorId].total += Math.abs(a);
  // here total shouldn't really matter
}

function createPostNode({ post, rankedNodes, nstart, user, rankedPosts, downvote }) {
  if (!post) return null;
  const { _id, data, title } = post;
  const postId = downvote ? _id + '__neg' : _id;
  rankedNodes[postId] = rankedNodes[postId] || {};
  rankedPosts[postId] = rankedPosts[postId] || post;
  if (!rankedNodes[user._id][postId]) {
    rankedNodes[user._id][postId] = {
      weight: 0,
      negative: 0,
      total: 0,
      title
    };
  }
  nstart[postId] = data
    ? Math.max(downvote ? data.pagerankRawNeg : data.pagerankRaw, 0)
    : 0;
  return postId;
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
      select: 'relevance handle',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    })
    .populate({
      path: 'author',
      select: 'relevance handle',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    })
    .populate({
      path: 'post',
      select: 'data title',
      options: { select: 'data body' },
      populate: {
        path: 'data',
        select: 'pagerank relevance pagerankRaw body needsRankUpdate'
      }
    });
}
