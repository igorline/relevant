const queue = require('queue');
const pagerank = require('../utils/pagerank').default;
const Invest = require('../api/invest/invest.model');
const CommunityMember = require('../api/community/community.member.model').default;
const Post = require('../api/post/post.model');
const PostData = require('../api/post/postData.model');
const Relevance = require('../api/relevance/relevance.model');
const { RELEVANCE_DECAY, REP_CUTOFF } = require('../config/globalConstants');
const Community = require('../api/community/community.model').default;

const q = queue({ concurrency: 10 });

/* eslint no-console: 0 */

async function updateItemRank(props) {
  const { max, maxPost, u, N, debug, communityId, community, maxRel } = props;
  let { min, minPost } = props;
  min = 0;
  minPost = 0;
  let rank = (100 * Math.log(N * (u.rank - min) + 1)) / Math.log(N * (max - min) + 1);
  const postRank =
    (100 * Math.log(N * (u.rank - minPost) + 1)) / Math.log(N * (maxPost - minPost) + 1);

  if (u.type === 'post') {
    rank = postRank;
  }

  rank = rank.toFixed(2);
  const rel = u.relevance;

  if (debug && u.type !== 'post') {
    console.log('name: ', u.id);
    console.log('PageRank ', rank, 'rel:', Math.round((100 * rel) / maxRel));
    console.log('-----');
  }

  if (u.type === 'user') {
    if (Number.isNaN(rank)) {
      return null;
    }
    return Relevance.findOneAndUpdate(
      { user: u.id, communityId, global: true },
      { pagerank: rank, pagerankRaw: u.rank, community },
      { new: true, upsert: true, fields: 'pagerank pagerankRaw user rank relevance' }
    );
  } else if (u.type === 'post') {
    if (Number.isNaN(rank)) {
      return null;
    }
    return PostData.findOneAndUpdate(
      { post: u.id, communityId },
      { pagerank: rank, pagerankRaw: u.rank },
      { new: true, fields: 'pagerank pagerankRaw post rank relevance' }
    );
  }
  return null;
}

function processUpvote(params) {
  const { rankedNodes, rankedPosts, nstart, upvote, user, now } = params;
  const { post, author, amount } = upvote;
  const authorId = author ? author._id : null;
  const userId = user._id;
  // TODO in query
  // if (ownPost) return;
  // same as OWN?
  // if (authorId && authorId === userId) return;

  // TODO once we track twitter users this won't be an issue
  // this is to make sure we rank twitter posts upvoted by users
  // if (!upvote.author) return;

  let a = amount / Math.abs(amount);
  if (!a) a = 1;

  // time discount (RELEVANCE_DECAY month half-life)
  const t = now.getTime() - upvote.createdAt.getTime();
  a *= (1 / 2) ** (t / RELEVANCE_DECAY);

  if (!rankedNodes[userId]) {
    nstart[userId] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
    rankedNodes[userId] = {};
  }

  if (authorId && !rankedNodes[userId][authorId]) {
    rankedNodes[userId][authorId] = { weight: 0, negative: 0, total: 0 };
  }

  if (post) {
    const { _id, data } = post;
    rankedNodes[_id] = {};
    rankedPosts[_id] = post;
    if (!rankedNodes[user._id][_id]) {
      rankedNodes[user._id][_id] = { weight: 0, negative: 0, total: 0 };
    }
    nstart[_id] = data ? Math.max(data.pagerankRaw, 0) : 0;
  }

  if (a < 0) {
    // console.log(user._id, 'downvoted', upvote.author, upvote.post.body);
    if (authorId) rankedNodes[userId][authorId].negative += -a;
    if (post) rankedNodes[userId][post._id].negative += -a;
  } else {
    if (authorId) rankedNodes[userId][authorId].weight += a;
    if (post) rankedNodes[userId][post._id].weight += a;
  }
  if (authorId) rankedNodes[userId][authorId].total += Math.abs(a);
  // here total shouldn't really matter
  if (post) rankedNodes[userId][post._id].total += Math.abs(a);
}

export async function computeApproxPageRank(params) {
  try {
    const { author, post, user, communityId, investment, undoInvest } = params;
    const com = await Community.findOne(
      { _id: communityId },
      'maxUserRank maxPostRank numberOfElements'
    );
    let amount;
    if (investment) ({ amount } = investment);
    const N = com.numberOfElements;
    const { maxUserRank, maxPostRank } = com;
    // if user relevance object doesn't exist, there is nothing to update
    if (!user.relevance || user.relevance.pagerankRaw <= 0) {
      return { author, post };
    }
    const userR = user.relevance ? user.relevance.pagerankRaw : 0;
    const authorId = author ? author._id : null;

    // only consider votes from REP_CUTOFF years ago
    const yearAgo = new Date().setFullYear(new Date().getFullYear() - REP_CUTOFF);

    const upvotes = await Invest.find({
      investor: user._id,
      communityId,
      createdAt: { $gt: yearAgo }
    })
    .populate({
      path: 'investor',
      select: 'relevance',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    })
    .populate({
      path: 'author',
      select: 'relevance',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    })
    .populate({
      path: 'post',
      options: { select: 'data body' },
      populate: {
        path: 'data',
        select: 'pagerank relevance pagerankRaw'
      }
    });

    const rankedNodes = {};
    const rankedPosts = {};
    const nstart = {};
    const now = new Date();

    if (investment) {
      investment.post = await Post.findOne(
        { _id: investment.post },
        'data body'
      ).populate({
        path: 'data',
        select: 'pagerank relevance pagerankRaw'
      });
    }

    upvotes.forEach(upvote =>
      processUpvote({
        rankedNodes,
        rankedPosts,
        nstart,
        upvote,
        user,
        now
      })
    );

    const userObj = rankedNodes[user._id];

    let degree = 0;

    // TODO: can we optimize this by storing degree in relevance table?
    Object.keys(userObj).forEach(vote => {
      let w = userObj[vote].weight;
      const n = userObj[vote].negative || 0;
      // eigentrust++ weights
      // w = Math.max((w - n) / (w + n), 0);
      w = Math.max(w - n, 0);
      userObj[vote].w = w;
      degree += w;
    });

    // Need a way to 0 out post votes and user votes
    let postVotes = true;
    let userVotes = true;
    if (undoInvest) {
      postVotes = await Invest.count({ post: post._id, ownPost: false });
      if (!postVotes) {
        post.data.pagerank = 0;
        post.data.pagerankRaw = 0;
        await post.data.save();
      }
      userVotes = await Invest.count({ author: authorId, ownPost: false });
      if (!userVotes) {
        author.relevance.pagerank = 0;
        author.relevance.pagerankRaw = 0;
        await author.relevance.save();
      }
      if (!postVotes && !userVotes) {
        return { author, post };
      }
    }

    // console.log(userObj);
    degree = degree || 1;

    const w = userObj[authorId] ? userObj[authorId].w : 0;
    const userWeight = w / degree;
    let postWeight;
    let oldWeight;

    // console.log('degree ', degree);
    if (amount >= 0) {
      if (undoInvest) {
        postWeight = 1 / (degree + 2);
        oldWeight = (w + 1) / (degree + 2);
        if (author) {
          author.relevance.pagerankRaw = Math.max(
            author.relevance.pagerankRaw + userR * (userWeight - oldWeight),
            0
          );
        }
        post.data.pagerankRaw = Math.max(post.data.pagerankRaw - userR * postWeight, 0);
      } else {
        postWeight = 1 / degree;
        oldWeight = Math.max(w - 1, 0) / Math.max(degree - 2, 1);
        if (userVotes && author) {
          author.relevance.pagerankRaw += userR * (userWeight - oldWeight);
        }
        if (postVotes) post.data.pagerankRaw += userR * postWeight;
      }
    } else if (amount < 0) {
      if (undoInvest) {
        // NOTE we let pagerankRaw get negative so we can undo downvotes that
        // take us below 0 correctly
        // This can create a weird effect in the edge case where
        // we undo the downvote AFTER pagerank recompute
        // TODO we can avoid this for posts by querying all
        // upvotes for a post and adding them together
        oldWeight = Math.max(w - 1, 0) / Math.max(degree - 1, 1);
        postWeight = degree >= 1 ? 1 / (degree - 1) : 0;
        // console.log('oldWeight', oldWeight);
        // console.log('userWeight', userWeight);
        // console.log('w', w);
        if (userVotes && author) {
          author.relevance.pagerankRaw += userR * (userWeight - oldWeight);
        }
        if (postVotes) post.data.pagerankRaw += userR * postWeight;
      } else {
        oldWeight = (w - 1) / (degree - 1);
        // console.log('oldWeight', oldWeight);
        // console.log('userWeight', userWeight);
        // console.log('w', w);
        postWeight = 1 / degree;
        if (author) author.relevance.pagerankRaw -= userR * (userWeight - oldWeight);
        post.data.pagerankRaw -= userR * postWeight;
      }
    }

    if (author) {
      const rA = author ? Math.max(author.relevance.pagerankRaw, 0) : 0;
      author.relevance.pagerank =
        (100 * Math.log(N * rA + 1)) / Math.log(N * maxUserRank + 1);
    }

    const pA = Math.max(post.data.pagerankRaw, 0);
    post.data.pagerank = (100 * Math.log(N * pA + 1)) / Math.log(N * maxPostRank + 1);

    await Promise.all([post.data.save(), author ? author.relevance.save() : null]);

    return { author, post };
  } catch (err) {
    console.log('page rank approx error ', err);
    return null;
  }
}

// compute relevance using pagerank
export default async function computePageRank(params) {
  try {
    const { author, post, debug, communityId, community, fast } = params;

    if (!community) throw new Error('missing community name');

    let { heapUsed } = process.memoryUsage();
    let mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Program is using ' + mb + 'MB of Heap.');
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
    const originalRelevance = {};
    const originalUsers = {};
    const originalPosts = {};
    const rankedPosts = {};
    const nstart = {};

    // only look at votes up to a REP_CUTOFF years ago
    const timeLimit = new Date().setFullYear(new Date().getFullYear() - REP_CUTOFF);

    const upvotes = await Invest.find({
      communityId,
      createdAt: { $gt: timeLimit },
      ownPost: { $ne: true },
      // author: { $exists: true },
      investor: { $exists: true }
    })
    .populate({
      path: 'investor',
      select: 'relevance',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    })
    .populate({
      path: 'author',
      select: 'relevance',
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
        select: 'pagerank relevance pagerankRaw body'
      }
    });

    upvotes.forEach(upvote => {
      const user = upvote.investor;
      if (!user) return null;
      const postAuthor = upvote.author;
      const { post: postObj } = upvote;
      // if (user && !originalUsers[user._id]) {
      //   originalUsers[user._id] = user;
      //   originalRelevance[user._id] = user.relevance ? user.relevance.relevance : 0;
      // }
      if (postObj && !originalPosts[postObj._id]) {
        originalPosts[postObj._id] = postObj._id;
      }
      if (postAuthor && !originalUsers[postAuthor._id]) {
        originalUsers[postAuthor._id] = postAuthor;
        originalRelevance[postAuthor._id] = postAuthor.relevance
          ? postAuthor.relevance.relevance
          : 0;
      }
      return processUpvote({
        rankedNodes,
        rankedPosts,
        nstart,
        upvote,
        user,
        now
      });
    });

    // TODO prune users with no upvotes
    Object.keys(rankedNodes).forEach(u => {
      if (!originalUsers[u] && !originalPosts[u]) {
        return delete rankedNodes[u];
      }
      return Object.keys(rankedNodes[u]).forEach(name => {
        // fills any missing names in list
        if (!rankedNodes[name]) {
          if (!originalUsers[name]) {
            // console.log('removing ', name);
            delete rankedNodes[u][name];
          } else {
            // console.log('adding ', name);
            const user = originalUsers[name];
            nstart[name] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
            rankedNodes[name] = {};
          }
        }
      });
    });

    const personalization = {};
    admins.forEach(a => {
      const userId = a.user._id;
      if (!rankedNodes[userId]) rankedNodes[userId] = {};
      personalization[userId] = 1;
      if (!nstart[userId]) {
        nstart[userId] = a.user.relevance ? Math.max(a.user.relevance.pagerankRaw, 0) : 0;
      }
      if (!rankedNodes[userId]) {
        rankedNodes[userId] = {};
      }
    });

    heapUsed = process.memoryUsage();
    mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Program is using ' + mb + 'MB of Heap.');

    console.log('user query time ', (new Date().getTime() - now) / 1000 + 's');

    const scores = pagerank(rankedNodes, {
      alpha: 0.85,
      users: originalUsers,
      personalization,
      negativeWeights,
      nstart,
      fast
    });

    heapUsed = process.memoryUsage().heapUsed;
    mb = Math.round((100 * heapUsed) / 1048576) / 100;
    console.log('Program is using ' + mb + 'MB of Heap.');

    let max = 0;
    const min = 0;
    let maxPost = 0;
    const minPost = 0;

    let array = [];
    Object.keys(scores).forEach(id => {
      let postNode;
      if (rankedPosts[id]) {
        postNode = rankedPosts[id];
      }

      const u = scores[id];
      if (postNode) maxPost = Math.max(u, maxPost);
      else max = Math.max(u, max);

      array.push({
        id,
        rank: u,
        relevance: postNode ? postNode.data.relevance : originalRelevance[id],
        type: postNode ? 'post' : 'user'
      });
    });

    const N = array.length;

    await Community.findOneAndUpdate(
      { _id: communityId },
      { maxPostRank: maxPost, maxUserRank: max, numberOfElements: N }
    );

    const maxRel = array.reduce((p, n) => Math.max(p, n.relevance || 0), 0);
    array = array.sort((a, b) => a.rank - b.rank);

    if (author) {
      let u = array.find(el => el.id.toString() === author._id.toString());
      u = await updateItemRank({
        min,
        max,
        minPost,
        maxPost,
        u,
        N,
        debug,
        communityId,
        community,
        maxRel
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
        community,
        maxRel
      });
      post.data.pagerank = u.pagerank;
    }

    array.forEach(async u => {
      q.push(async cb => {
        try {
          await updateItemRank({
            min,
            max,
            minPost,
            maxPost,
            u,
            N,
            debug,
            communityId,
            community,
            maxRel
          });
        } catch (err) {
          throw err;
        }
        cb();
      });
    });

    return new Promise((resolve, reject) =>
      q.start(err => {
        if (err) reject(err);
        resolve({ author, post });
      })
    );

    // if (author || post) {
    //   return { author, post };
    // }
    // updatedUsers = await Promise.all(updatedUsers);
    // console.log(updatedUsers);
  } catch (err) {
    throw err;
  }
}
