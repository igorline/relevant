import User from '../api/user/user.model';
import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
import Relevance from '../api/relevance/relevance.model';
import Post from '../api/post/post.model';
import CommunityFeed from '../api/communityFeed/communityFeed.model';
import Treasury from '../api/treasury/treasury.model';
import Comment from '../api/comment/comment.model';
import PostData from '../api/post/postData.model';
import Community from '../api/community/community.model';

const queue = require('queue');
let q = queue({
  concurrency: 1,
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
  let community = await Community.findOne({ slug: 'relevant' });
  users = users.map(async u => community.join(u._id));
  return Promise.all(users);
}

async function migratePosts() {
  let posts = await Post.find({}).populate('metaPost');
  let processed = posts.map((post, i) => {
    q.push(async cb => {
      console.log('processing ', i, ' out of ', posts.length);
      if (post.twitter) {
        // console.log(post.metaPost.title);
        // console.log(post.community);
        // console.log(post.relevance);
        // console.log(post.rank);
        if (post.relevance === 0) {
          post.community = 'relevant-twitter';
        }
        // await post.save();
      }
      if (!post.community) {
        post.community = 'relevant';
        // console.log('warning: missing community ', post);
      }
      if (!post.communityId) {
        let community = await Community.findOne({ slug: post.community });
        post.communityId = community._id;
      }
      post.data = await PostData.findOne({ post: post._id, community: post.community });

      if (!post.data) await post.addPostData();

      await post.updateRank(post.community);

      if (post.type === 'post' && !post.twitter) {
        if (post.metaPost && post.metaPost.url) {
          let linkObject = post.metaPost.toObject();
          await post.upsertLinkParent(linkObject);
        } else {
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
  let comments = await Comment.find({ repost: false });
  let processed = comments.map(async comment => {
    try {
      comment = comment.toObject();
      delete comment._id;
      comment.parentPost = comment.post;
      let parentPost = await Post.findOne({ _id: comment.post });
      console.log('has parent');
      if (!parentPost) return;
      comment.body = comment.text;
      let post = new Post(comment);
      post.community = parentPost.community;
      post.type = 'comment';
      post.aboutLink = parentPost.aboutLink;
      post.metaPost = parentPost.metaPost;
      let user = await User.findOne({ _id: post.user });
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


async function runUpdates() {
  try {
    // await cleanNewerPosts();
    // await migratePosts();

    // await cleanCommentPosts();
    // await updateComments();
    // await communityMembers();
    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
