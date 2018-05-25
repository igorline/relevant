import User from '../api/user/user.model';
import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
import Relevance from '../api/relevance/relevance.model';
import Post from '../api/post/post.model';
import CommunityFeed from '../api/communityFeed/communityFeed.model';
import MetaPost from '../api/metaPost/metaPost.model';
import Treasury from '../api/treasury/treasury.model';
import Comment from '../api/comment/comment.model';

// CommunityFeed.find({ community: 'relevant' }).remove().exec();

async function updateTreasury() {
  let t = await Treasury.findOne({ community: { $exists: false } });
  if (!t) return true;
  console.log('treasury to update ', );
  t.community = 'relevant';
  return t.save();
}

async function removeEmptyCommunityFeedEls() {
  let community = 'relevant';

  let cf = await CommunityFeed.find({}, 'metaPost')
    .populate({
      path: 'metaPost',
      select: 'commentary title latestPost',
      populate: [
        {
          path: 'commentary',
          match: { community, repost: { $exists: false } },
          // options: { sort: commentarySort },
          populate: {
            path: 'embeddedUser.relevance',
            select: 'relevance'
          },
        },
      ]
    });

  let filtered = cf.filter(el => !el.metaPost.commentary.length);
  let removeItems = filtered.map(f => f.remove());
  return Promise.all(removeItems);
}


async function updateUserHandles() {
  console.log('POPULATING HANDLES');
  let users = await User.find({}, '_id handle');
  let update = users.map(async user => {
    user.handle = user._id;
    console.log(user);
    return await user.save();
  });
  return await Promise.all(update);
}

async function addStatCommuntyField() {
  console.log('ADDING STAT COMMUNITY FIELD');
  return await RelevanceStats.update(
    { community: { $exists: false } },
    { community: 'relevant' },
    { multi: true }
  ).exec();
}

async function migrateToCommunityReputation() {
  try {
    let users = await User.find({});
    // update existing reps w community
    await Relevance.update(
      { community: { $exists: false }, twitter: false },
      { community: 'relevant' },
      { multi: true }
    );
    // await Relevance.update({ community: { $exists: false }, twitter: true }, { community: 'twitter' });

    // let allDone = users.map(async u => {
    //   try {
    //     let newRep = await Relevance.findOneAndUpdate(
    //       { community: 'relevant', user: u._id, tag: { $exists: false } },
    //       { relevance: u.relevance,
    //         level: u.level || 0,
    //         rank: u.rank || 0,
    //         percentRank: u.percentRank || 0,
    //         relevanceRecord: u.relevanceRecord,
    //         global: true,
    //       },
    //       { upsert: true, new: true }
    //     );
    //     console.log(newRep);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
    // return Promise.all(allDone);
  } catch (err) {
    console.log(err);
  }
}


async function connectReputation() {
  try {
    await Post.update(
      { community: { $exists: false }, twitter: false },
      { community: 'relevant' },
      { multi: true }
    ).exec();
    await Post.update(
      { twitter: true },
      { community: 'twitter' },
      { multi: true }
    ).exec();
    let posts = await Post.find({});
    let allDone = await posts.map(async p => {
      try {
        let community = p.community;
        let rep = await Relevance.findOne({ user: p.user, community, global: true });
        if (!rep) return console.log('no rep!');
        p.embeddedUser.relevance = rep._id;
        console.log(p.embeddedUser);
        return await p.save();
      } catch (err) {
        console.log(err);
      }
    });
    return await Promise.all(allDone);
  } catch(err) {
    console.log(err);
  }
}


async function createRelevantCommunityFeed() {
  let community = 'relevant';
  await CommunityFeed.find({ community }).remove();

  let metaIds = await Post.find({ community }, 'metaPost');
  metaIds = metaIds.map(p => p.metaPost);

  let twMetas = await Post.find({ twitter: true, upVotes: { $gt: 0 } }, 'metaPost')
  twMetas = twMetas.map(p => p.metaPost);

  metaIds = [ ...metaIds, ...twMetas ];

  let metaPosts = await MetaPost.find(
    { _id: { $in: metaIds } },
    '_id rank latestPost tags categories keywords'
  );

  let allDone = await metaPosts.map(async meta => {
    let feedItem = await CommunityFeed.findOneAndUpdate(
      { community, metaPost: meta._id },
      {
        latestPost: meta.latestPost,
        tags: meta.tags,
        categories: meta.categories,
        keywords: meta.keywords,
        rank: meta.rank || 0
      },
      { upsert: true, new: true }
    );
    // console.log(feedItem);
    return feedItem;
  });
  return await Promise.all(allDone);
}

async function updatePostUserHandle() {
  let posts = await Post.find({}).populate({
    path: 'user',
    select: 'handle',
  });
  let updatedPosts = posts.map(async post => {
    if (!post.embeddedUser || !post.user) return;
    post.embeddedUser.handle = post.user.handle;
    return post.save();
  });
  return Promise.all(updatedPosts);
}

async function updateCommentUserHandle() {
  let comments = await Comment.find({}).populate({
    path: 'user',
    select: 'handle',
  });
  let updatedComments = comments.map(async comment => {
    comment.embeddedUser.handle = comment.user.handle;
    return comment.save();
  });
  return Promise.all(updatedComments);
}

async function runUpdates() {
  try {
    // await updateUserHandles();
    // await addStatCommuntyField();
    // await migrateToCommunityReputation();
    // await connectReputation();
    // await createRelevantCommunityFeed();
    // await updateTreasury();
    // await updatePostUserHandle();
    await updateCommentUserHandle();

    // await removeEmptyCommunityFeedEls()
    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

runUpdates();
