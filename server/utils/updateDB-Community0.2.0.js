import User from '../api/user/user.model';
import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
import Relevance from '../api/relevance/relevance.model';
import Post from '../api/post/post.model';
import CommunityFeed from '../api/communityFeed/communityFeed.model';
import MetaPost from '../api/metaPost/metaPost.model';
import Treasury from '../api/treasury/treasury.model';
import Comment from '../api/comment/comment.model';

// CommunityFeed.find({ community: 'relevant' }).remove().exec();

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
      post.isComment = true;
      post.metaPost = parentPost.metaPost;
      let user = await User.findOne({ _id: post.user });
      post = post.addUserInfo(user);
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
  // let posts = await Post.find({ parentPost: { $exists: true }, 'repost.post': { $exists: false }});
  // console.log(posts);
  await Post.find({ parentPost: { $exists: true }, 'repost.post': { $exists: false }}).remove();
}

async function runUpdates() {
  try {
    // await cleanCommentPosts();
    await updateComments();
    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
