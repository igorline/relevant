import User from '../api/user/user.model';
import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
import Stats from '../api/statistics/statistics.model';
import Relevance from '../api/relevance/relevance.model';
import Post from '../api/post/post.model';
import CommunityFeed from '../api/communityFeed/communityFeed.model';
import Treasury from '../api/treasury/treasury.model';
import Comment from '../api/comment/comment.model';
import PostData from '../api/post/postData.model';
import Community from '../api/community/community.model';
import Invest from '../api/invest/invest.model';

// TODO update post embedded user to _id
// user check handle?
const DEFAULT_COMMINITY = 'relevant';
let DEFAULT_COMMINITY_ID;

const queue = require('queue');

const q = queue({
  concurrency: 20,
});

// Post.findOne({ body: '@jay #test 22222' }).then(console.log);
// PostData.findOne({ post: '5bbaa60b2a22fe381a66598c' }).remove().exec();
// CommunityFeed.find({ community: 'relevant' }).remove().exec();

async function cleanNewerPosts() {
  await Post.find({ type: 'link' }).remove();
  await PostData.find({}).remove();
  await CommunityFeed.find({ post: { $exists: true } }).remove();
}

// async function cleanPostData() {
//   await PostData.find({}).remove();
// }

async function communityMembers() {
  let users = await User.find({});
  const community = await Community.findOne({ slug: 'relevant' });
  users = users.map(async u => community.join(u._id));
  return Promise.all(users);
}

async function migratePosts() {
  const posts = await Post.find({ $or: [{ twitter: { $ne: true } }, { relevance: { $gt: 0 } }] })
    .populate('metaPost');
  // return console.log(posts);
  const processed = posts.map((post, i) => {
    q.push(async cb => {
      console.log('processing ', i, ' out of ', posts.length);
      const tmpId = post.parentPost || post._id;

      const inFeed = await CommunityFeed.findOne({ post: tmpId });
      if (inFeed) return; // post.updateRank(post.community, true);

      if (post.type === 'link') {
        console.log('--------');
        console.log('date ', post.postDate);
        console.log('txt ', post.body);
        console.log('meta ', post.metaPost ? post.metaPost.url : null);
        console.log('type ', post.type);
        return;
      }


      if (post.community === 'twitter') post.community = 'relevant';
      if (post.community === 'relevant') {
        post.communityId = DEFAULT_COMMINITY_ID;
      }

      if (!post.community) {
        post.community = DEFAULT_COMMINITY;
        post.communityId = DEFAULT_COMMINITY_ID;
        // console.log('warning: missing community ', post);
      }
      if (!post.communityId) {
        const community = await Community.findOne({ slug: post.community });
        if (!community) {
          console.log('missing community ', post.community);
          post.community = DEFAULT_COMMINITY;
          post.communityId = DEFAULT_COMMINITY_ID;
        } else {
          post.communityId = community._id;
        }
      }
      post.data = await PostData.findOne({ post: post._id, community: post.community });

      if (!post.data) await post.addPostData();

      if (post.repost && post.repost.post) post.type = 'repost';
      if (!post.type) post.type = 'post';

      if (!post.hidden) {
        const dontInsertIntoFeed = true;
        await post.updateRank(post.community, dontInsertIntoFeed);
      }

      if (post.type === 'post') {
        if (post.metaPost && post.metaPost.url) {
          const linkObject = post.metaPost.toObject();
          await post.upsertLinkParent(linkObject);
        } else if (!post.hidden && post.type === 'post') {
          // THESE ARE OUR TEXT POSTS
          await post.updateRank(post.community);
          await post.insertIntoFeed(post.community);
        }
      }
      cb();
    });
  });

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished queue');
  });
  // await Promise.all(processed);
}


async function updateComments() {
  const comments = await Comment.find({ repost: false });
  const processed = comments.map(async comment => {
    try {
      const exists = await Post.findOne({ body: comment.text, user: comment.user, parentPost: comment.post });
      if (exists) return null;
      if (!exists) {
        return console.log(comment);
      }
      comment = comment.toObject();
      delete comment._id;
      comment.parentPost = comment.post;
      const parentPost = await Post.findOne({ _id: comment.post });
      console.log('has parent');
      if (!parentPost) return;
      comment.body = comment.text;
      let post = new Post(comment);
      post.community = parentPost.community;
      // post.communityId = parentPost.communityId;
      post.type = 'comment';
      post.aboutLink = parentPost.aboutLink;
      post.metaPost = parentPost.metaPost;
      const user = await User.findOne({ _id: post.user });
      post = await post.addUserInfo(user);
      post = await post.save();
      console.log(post);

      await parentPost.save();
    } catch (err) {
      console.log(err);
    }
  });
  await Promise.all(processed);
  let reposts = await Post.find({ 'repost.post': { $exists: true } });
  reposts = reposts.map(async repost => {
    try {
      repost.parentPost = repost.post;
      repost.body = repost.commentBody;
      repost.isRepost = true;
      await repost.save();
    } catch (err) {
      console.log(err);
    }
  });
  await Promise.all(reposts);
  // console.log(reposts);
}

async function cleanCommentPosts() {
  // await Post.find({ type: 'comment', 'repost.post': { $exists: false } }).remove();
}

async function updateInvestments() {
  let investments = await Invest.find({})
    .populate({ path: 'post', select: 'community communityId' });

  investments = investments.map(async inv => {
    const post = inv.post;
    if (!post) {
      inv.community = DEFAULT_COMMINITY;
      inv.communityId = DEFAULT_COMMINITY_ID;
      return inv.save();
      console.log('missing post ', inv);
    }
    inv.community = post.community;
    if (!post.communityId) {
      const community = await Community.findOne({ slug: post.community });
      post.communityId = community._id;
      await post.communityId;
    }
    inv.communityId = inv.post.communityId;
    console.log(inv);
    return inv.save();
  });
  return Promise.all(investments);
}

async function updateRelevance() {
  let rels = await Relevance.find({});
  rels = rels.map(async r => {
    let id = DEFAULT_COMMINITY_ID;
    if (!r.community) {
      // console.log('missing rep community ', r);
      r.community = DEFAULT_COMMINITY;
      r.communityId = DEFAULT_COMMINITY_ID;
      return r.save();
    }
    if (r.community === 'twitter') r.community = DEFAULT_COMMINITY;

    if (r.community !== DEFAULT_COMMINITY) {
      const c = await Community.findOne({ slug: r.community });
      if (!c) {
        console.log('missing community ', r.community);
      }
      id = c._id;
    }
    r.communityId = id;
    if (!r.communityId) console.log('soming went wrong', r);
    return r.save();
  });
  return Promise.all(rels);
}

// async function cleanRelevance() {
//   let rels = await Relevance.find({});
//   rels = rels.map(async r => {
//     console.log(r.community);
//   });
// }

async function updateStats() {
  const stats = await RelevanceStats.update({},
    {
      community: DEFAULT_COMMINITY,
      communityId: DEFAULT_COMMINITY_ID
    },
    { multi: true }
  );
  return stats;
}

async function updateActualStats() {
  const stats = await Stats.update(
    {},
    {
      communityId: DEFAULT_COMMINITY_ID,
      community: DEFAULT_COMMINITY
    },
    { multi: true }
  );
  return stats;
}

async function cleanRelevance() {
  let users = await User.find({});
  users = users.map(async u => {
    const count = await Relevance.count({ user: u._id, global: true });
    if (count > 1) {
      let rel = await Relevance.find({ user: u.handle, global: true }).sort('-relevance');
      const existingC = {};
      const existingU = {};
      rel = rel.map(r => {
        if (existingC[r.communityId]) {
          console.log('double! ');
          console.log(r.user, r.community, r.communityId, r);
          console.log(existingC[r.communityId].relevance);
          // test first!
          // return r.remove();
        }
        if (existingU[r.user]) {
          console.log('double user!');
          console.log(r.user, r.community, r);
        }
        existingC[r.communityId] = r;
        existingU[r.user] = r;
      });
      return Promise.all(rel);
    }
  });
  return Promise.all(users);
}

async function hideTwitterPosts() {
  const posts = await Post.find({ twitter: true, hidden: false });
  console.log(posts);

  // let posts = await Post.update(
//     { twitter: true, relevance: { $lte: 0 } },
//     { hidden: true },
//     { multi: true }
//   );
//   return posts;
}

async function postUrl() {
  try {
    const posts = await Post.find({
      url: { $exists: false }, link: { $exists: true }
    });
    posts.forEach(p => {
      console.log(p.url);
      console.log(p.link);
    });
  } catch (err) {
    console.log(err);
  }
}

async function runUpdates() {
  try {
    const dc = await Community.findOne({ slug: DEFAULT_COMMINITY });
    DEFAULT_COMMINITY_ID = dc._id;

    // await cleanNewerPosts();
    // await cleanCommentPosts();

    // await updateComments();
    // await migratePosts();

    // await communityMembers();
    // await updateInvestments();
    // await updateRelevance();
    // await updateStats();
    // await updateActualStats();
    // await cleanRelevance();
    // await hideTwitterPosts();
    // await postUrl();
    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
