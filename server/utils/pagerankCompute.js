const pagerank = require('../utils/pagerankClean').default;
// const pagerank = require('../utils/pagerankCleanMat').default;
const User = require('../api/user/user.model');
const Invest = require('../api/invest/invest.model');
const CommunityMember = require('../api/community/community.member.model').default;
const Post = require('../api/post/post.model');
const PostData = require('../api/post/postData.model');
const Relevance = require('../api/relevance/relevance.model');
const RELEVANCE_DECAY = require('../config/globalConstants').RELEVANCE_DECAY;
const Community = require('../api/community/community.model').default;

function updateItemRank(props) {
  let { min, max, minPost, maxPost, u, N, debug, communityId, community, maxRel } = props;
  min = 0;
  minPost = 0;
  let rank = 100 * Math.log(N * (u.rank - min) + 1) / Math.log(N * (max - min) + 1);
  let postRank = 100 * Math.log(N * (u.rank - minPost) + 1) / Math.log(N * (maxPost - minPost) + 1);

  if (u.type === 'post') {
    rank = postRank;
  }

  rank = rank.toFixed(2);
  let rel = u.relevance;

  if (debug && u.type !== 'post') {
    console.log('name: ', u.id);
    console.log('PageRank ', rank, 'rel:', Math.round(100 * rel / maxRel));
    console.log('-----');
  }

  if (u.type === 'user') {
    // let pr = Math.round(100 * rank / maxRank);
    if (isNaN(rank)) {
      console.log(u);
      return null;
    }
    return Relevance.findOneAndUpdate(
      { user: u.id, communityId, global: true },
      { pagerank: rank, pagerankRaw: u.rank, community },
      { new: true, upsert: true, fields: 'pagerank pagerankRaw user rank relevance' }
    );
  } else if (u.type === 'post') {
    // let pr = Math.round(100 * rank / maxRank);
    if (isNaN(rank)) {
      console.log(u);
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
  let { rankedNodes, rankedPosts, nstart, upvote, user, now } = params;
  let { post, ownPost, author, amount } = upvote;
  let authorId = author ? author._id : null;
  let userId = user._id;
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
  let t = now.getTime() - upvote.createdAt.getTime();
  a *= (1 / 2) ** (t / RELEVANCE_DECAY);

  if (!rankedNodes[userId]) {
    nstart[userId] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
    rankedNodes[userId] = {};
  }

  if (authorId && !rankedNodes[userId][authorId]) {
    rankedNodes[userId][authorId] = { weight: 0, negative: 0, total: 0 };
  }

  if (post) {
    let { _id, data } = post;
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
    let { author, post, user, communityId, investment, undoInvest } = params;
    let com = await Community.findOne({ _id: communityId }, 'maxUserRank maxPostRank numberOfElements');
    let amount;
    if (investment) ({ amount } = investment);
    let N = com.numberOfElements;
    let { maxUserRank, maxPostRank } = com;
    // if user relevance object doesn't exist, there is nothing to update
    if (!user.relevance || user.relevance.pagerankRaw <= 0) {
      return { author, post };
    }
    let userR = user.relevance ? user.relevance.pagerankRaw : 0;
    let authorId = author ? author._id : null;

    let yearAgo = new Date().setFullYear(new Date().getFullYear() - 2);
    let upvotes = await Invest.find({
      investor: user._id, communityId, createdAt: { $gt: yearAgo }
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

    let rankedNodes = {};
    let rankedPosts = {};
    let nstart = {};
    let now = new Date();

    if (investment) {
      investment.post = await Post.findOne({ _id: investment.post }, 'data body')
      .populate({
        path: 'data',
        select: 'pagerank relevance pagerankRaw'
      });
    }

    upvotes.forEach(upvote => processUpvote({
      rankedNodes, rankedPosts, nstart, upvote, user, now
    }));

    let userObj = rankedNodes[user._id];

    let degree = 0;

    // TODO: can we optimize this by storing degree in relevance table?
    Object.keys(userObj).forEach(vote => {
      let w = userObj[vote].weight;
      let n = userObj[vote].negative || 0;
      // eigentrust++ weights
      // w = Math.max((w - n) / (w + n), 0);
      w = Math.max((w - n), 0);
      userObj[vote].w = w;
      degree += w;
    });

    // Need a way to 0 out post votes and user votes
    let postVotes = true;
    let userVotes = true;
    if (undoInvest) {
      postVotes = await Invest.count({ post: post._id, ownPost: false });
      console.log('postVotes ', postVotes);
      if (!postVotes) {
        post.data.pagerank = 0;
        post.data.pagerankRaw = 0;
        await post.data.save();
      }
      userVotes = await Invest.count({ author: authorId, ownPost: false });
      console.log('userVotes ', userVotes);
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

    let w = userObj[authorId] ? userObj[authorId].w : 0;
    let userWeight = w / degree;
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
        if (userVotes && author) author.relevance.pagerankRaw += userR * (userWeight - oldWeight);
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
        if (userVotes && author) author.relevance.pagerankRaw += userR * (userWeight - oldWeight);
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
      let rA = author ? Math.max(author.relevance.pagerankRaw, 0) : 0;
      author.relevance.pagerank =
        100 * Math.log(N * rA + 1) /
        Math.log(N * maxUserRank + 1);
    }

    let pA = Math.max(post.data.pagerankRaw, 0);
    post.data.pagerank =
      100 * Math.log(N * pA + 1) /
      Math.log(N * maxPostRank + 1);

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
    let { author, post, debug, communityId, community, fast } = params;

    if (!community) throw new Error('missing community name');

    // let users = await User.find({})
    // .populate({ path: 'relevance', match: { communityId, global: true } });

    let now = new Date();

    let admins = await CommunityMember.find({ role: 'admin', communityId: communityId })
    .populate({
      path: 'user',
      select: 'relevance',
      populate: {
        path: 'relevance',
        match: { communityId, global: true },
        select: 'pagerank pagerankRaw relevance'
      }
    });
    // let N = users.length;

    let rankedNodes = {};
    let negativeWeights = {};
    let originalRelevance = {};
    let originalUsers = {};
    let rankedPosts = {};
    let nstart = {};
    // let results = users.map(async user => {
    // originalUsers[user._id] = user;
    // originalRelevance[user._id] = user.relevance ? user.relevance.relevance : 0;

    // // only look at votes up to a year ago
    let timeLimit = new Date().setFullYear(new Date().getFullYear() - 2);

    let upvotes = await Invest.find({
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
      let user = upvote.investor;
      let author = upvote.author;
      if (user && !originalUsers[user._id]) {
        originalUsers[user._id] = user;
        originalRelevance[user._id] = user.relevance ? user.relevance.relevance : 0;
      }
      if (author && !originalUsers[author._id]) {
        originalUsers[author._id] = author;
        originalRelevance[author._id] = author.relevance ? author.relevance.relevance : 0;
      }
      processUpvote({
        rankedNodes, rankedPosts, nstart, upvote, user, now
      });
    });
    // return upvotes;
    // });

    await Promise.all(upvotes);

    Object.keys(rankedNodes).forEach(u => {
      // if (!originalUsers[u]) return delete rankedNodes[u];
      Object.keys(rankedNodes[u]).forEach(name => {
        // fills any missing names in list
        if (!rankedNodes[name]) {
          if (!originalUsers[name]) {
            // console.log('removing ', name);
            delete rankedNodes[u][name];
          } else {
            // console.log('adding ', name);
            let user = originalUsers[name];
            nstart[name] = user.relevance ? Math.max(user.relevance.pagerankRaw, 0) : 0;
            rankedNodes[name] = {};
          }
        }
      });
    });

    let personalization = {};
    admins.forEach(a => {
      let userId = a.user._id;
      if (!rankedNodes[userId]) rankedNodes[userId] = {};
      personalization[userId] = 1;
      if (!nstart[userId]) {
        nstart[userId] = a.user.relevance ? Math.max(a.user.relevance.pagerankRaw, 0) : 0;
      }
      if (!rankedNodes[userId]) {
        rankedNodes[userId] = {};
      }
    });

    // console.log('personalization', personalization);
    // console.log('nstart', nstart)

    console.log('user query time ', ((new Date()).getTime() - now) / 1000 + 's');

    let scores = pagerank(
      rankedNodes,
      {
        alpha: 0.85,
        users: originalUsers,
        personalization,
        negativeWeights,
        nstart,
        fast
      }
    );

    let max = 0;
    let min = 0;
    let maxPost = 0;
    let minPost = 0;

    let array = [];
    Object.keys(scores).forEach(id => {
      let postNode;
      if (rankedPosts[id]) {
        postNode = rankedPosts[id];
      }

      let u = scores[id];
      if (postNode) maxPost = Math.max(u, maxPost);

      else max = Math.max(u, max);

      array.push({
        id,
        rank: u,
        relevance: postNode ? postNode.data.relevance : originalRelevance[id],
        type: postNode ? 'post' : 'user'
      });
    });

    let N = array.length;

    await Community.findOneAndUpdate(
      { _id: communityId },
      { maxPostRank: maxPost, maxUserRank: max, numberOfElements: N }
    );

    let maxRel = array.reduce((p, n) => Math.max(p, n.relevance || 0), 0);
    array = array.sort((a, b) => a.rank - b.rank);

    if (author) {
      let u = array.find(el => el.id.toString() === author._id.toString());
      u = await updateItemRank({
        min, max, minPost, maxPost, u, N, debug, communityId, community, maxRel
      });
      author.relevance.pagerank = u.pagerank;
    }

    if (post) {
      let u = array.find(el => el.id.toString() === post._id.toString());
      if (!u) u = { id: post._id, rank: 0, relevance: 0, type: 'post' };
      u = await updateItemRank({
        min, max, minPost, maxPost, u, N, debug, communityId, community, maxRel
      });
      post.data.pagerank = u.pagerank;
    }

    let updatedUsers = array.map(u => {
      return updateItemRank({
        min, max, minPost, maxPost, u, N, debug, communityId, community, maxRel
      });
    });
    // await author.reputation.save();
    // await post.data.save();
    if (author || post) {
      return { author, post };
    }
    updatedUsers = await Promise.all(updatedUsers);
    // console.log(updatedUsers);
  } catch (err) {
    console.log(err);
  }
}
