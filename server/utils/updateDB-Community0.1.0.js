import User from '../api/user/user.model';
// import RelevanceStats from '../api/relevanceStats/relevanceStats.model';
import Relevance from '../api/relevance/relevance.model';
import Post from '../api/post/post.model';
import CommunityFeed from '../api/communityFeed/communityFeed.model';
import MetaPost from '../api/post/link.model';
import Treasury from '../api/treasury/treasury.model';

// CommunityFeed.find({ community: 'relevant' }).remove().exec();

/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

async function updateTreasury() {
  const t = await Treasury.findOne({ community: { $exists: false } });
  if (!t) return true;
  t.community = 'relevant';
  return t.save();
}

async function removeEmptyCommunityFeedEls() {
  const community = 'relevant';

  const cf = await CommunityFeed.find({}, 'metaPost').populate({
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
        }
      }
    ]
  });

  const filtered = cf.filter(el => !el.metaPost.commentary.length);
  const removeItems = filtered.map(f => f.remove());
  return Promise.all(removeItems);
}

async function updateUserHandles() {
  const users = await User.find({}, '_id handle');
  const update = users.map(async user => {
    user.handle = user._id;
    return user.save();
  });
  return Promise.all(update);
}

// async function addStatCommuntyField() {
//   console.log('ADDING STAT COMMUNITY FIELD');
//   return RelevanceStats.update(
//     { community: { $exists: false } },
//     { community: 'relevant' },
//     { multi: true }
//   ).exec();
// }

async function migrateToCommunityReputation() {
  try {
    const users = await User.find({});
    // update existing reps w community
    await Relevance.update(
      { community: { $exists: false }, twitter: false },
      { community: 'relevant' },
      { multi: true }
    );
    // await Relevance
    // .update({ community: { $exists: false }, twitter: true }, { community: 'twitter' });
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
    throw err;
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
    const posts = await Post.find({});
    const allDone = await posts.map(async p => {
      try {
        const { community } = p;
        const rep = await Relevance.findOne({ user: p.user, community, global: true });
        if (!rep) return console.log('no rep!');
        p.embeddedUser.relevance = rep._id;
        return await p.save();
      } catch (err) {
        throw err;
      }
    });
    return Promise.all(allDone);
  } catch (err) {
    throw err;
  }
}

async function createRelevantCommunityFeed() {
  const community = 'relevant';
  await CommunityFeed.find({ community }).remove();

  let metaIds = await Post.find({ community }, 'metaPost');
  metaIds = metaIds.map(p => p.metaPost);

  let twMetas = await Post.find({ twitter: true, upVotes: { $gt: 0 } }, 'metaPost');
  twMetas = twMetas.map(p => p.metaPost);

  metaIds = [...metaIds, ...twMetas];

  const metaPosts = await MetaPost.find(
    { _id: { $in: metaIds } },
    '_id rank latestPost tags categories keywords'
  );

  const allDone = await metaPosts.map(async meta => {
    const feedItem = await CommunityFeed.findOneAndUpdate(
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
  return Promise.all(allDone);
}

async function updatePostUserHandle() {
  const posts = await Post.find({}).populate({
    path: 'user',
    select: 'handle'
  });
  const updatedPosts = posts.map(async post => {
    if (!post.embeddedUser) return null;
    if (!post.user) post.embeddedUser.handle = post.embeddedUser.id;
    else post.embeddedUser.handle = post.user.handle;
    return post.save();
  });
  return Promise.all(updatedPosts);
}

async function updateCommentUserHandle() {
  const comments = await Comment.find({}).populate({
    path: 'user',
    select: 'handle'
  });
  const updatedComments = comments.map(async comment => {
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
    // await updateCommentUserHandle();

    // await removeEmptyCommunityFeedEls()
    console.log('finished db updates');
  } catch (err) {
    throw err;
  }
}

// runUpdates();
