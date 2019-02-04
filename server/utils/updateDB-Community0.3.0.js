import mongoose from 'mongoose';
import Post from 'server/api/post/post.model';
import CommunityMember from 'server/api/community/community.member.model';
import User from 'server/api/user/user.model';
import PostData from 'server/api/post/postData.model';
import Community from 'server/api/community/community.model';
import Relevance from 'server/api/relevance/relevance.model';
import Notification from 'server/api/notification/notification.model';
import Invest from 'server/api/invest/invest.model';
import Earnings from 'server/api/earnings/earnings.model';
import Subscription from 'server/api/subscription/subscription.model';
import Statistics from 'server/api/statistics/statistics.model';
import Feed from 'server/api/feed/feed.model';
import { previewDataAsync } from 'server/api/post/post.controller';

const { ObjectId } = mongoose.Types;

const queue = require('queue');

const q = queue({
  concurrency: 20
});

// TODO update post embedded user to _id
// user check handle?
const DEFAULT_COMMINITY = 'relevant';
let DEFAULT_COMMINITY_ID;

/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

async function populateCommunityEmbeddedUsuer() {
  let members = await CommunityMember.find({ 'embeddedUser.handle': { $exists: false } })
  .populate('user', 'name handle image');
  members = members.map(m => {
    m.embeddedUser = m.user.toObject();
    return m.save();
  });
  return Promise.all(members);
}

async function updateMemberCount() {
  let communities = await Community.find({});
  communities = communities.map(c => c.updateMemeberCount());
  return Promise.all(communities);
}

// check empty post data
async function cleanupPostData() {
  let postData = await PostData.find({}).populate('post');
  postData = postData
  .filter(d => !d.post)
  .map(d => {
    console.log(d.toObject());
    return d.remove();
  });
  return Promise.all(postData);
}


async function updateUserIdType() {
  let users = await User.find({}, `
    +email
    +phone
    +hashedPassword
    +salt
    +twitter
    +confirmCode
    +resetPasswordToken
    +resetPasswordExpires
    +blocked
    +blockedBy
    +accumilatedDecay
    +twitterEmail
    +twitterAuthToken
    +twitterAuthSecret
    `
  );
  users = users.map(async u => {
    let newUser = u.toObject();
    delete newUser.__v;
    newUser = new User(newUser);
    console.log('User ', u._id, u.handle);
    newUser.version = 'objectId';
    newUser._id = ObjectId();
    if (newUser.twitter) {
      newUser.twitterId = newUser.twitter.id_str;
      u.twitterId = newUser.twitter.id_str + '__DUP__';
    }
    console.log('New User', newUser.toObject());
    u.version = 'stringID';
    u.handle += '__DUP__';
    if (u.publicKey) u.publicKey += '__DUP__';
    console.log('Old User', u.toObject());
    await u.save();
    return newUser.save();
  });
  return Promise.all(users);
}

async function convertIdToObject() {
  // const user = await User.findOne({ _id: '5c4267177f81360b10b4b196' });
  // console.log('user ', user);
  let users = await User.find({ version: 'objectId' }, `
    +email
    +phone
    +hashedPassword
    +salt
    +twitter
    +confirmCode
    +resetPasswordToken
    +resetPasswordExpires
    +blocked
    +blockedBy
    +accumilatedDecay
    +twitterEmail
    +twitterAuthToken
    +twitterAuthSecret
    `
  );
  users = users.map(async u => {
    console.log('found user', u._id, u.handle);
    let newUser = u.toObject();
    delete newUser.__v;
    newUser._id = ObjectId(newUser._id);
    newUser = new User(newUser);
    // console.log(newUser.toObject());
    // await User.remove({ handle: u.handle }).exec();
    // return newUser.save();
  });
  return Promise.all(users);
}


async function checkEmbeddedUser() {
  let posts = await Post.find({
    embeddedUser: { $exists: true },
    twitter: { $ne: true },
    // eslint-disable-next-line
    $where: function() {
      return this.user !== this.embeddedUser.handle;
    }
  });
  posts = posts.map(p => {
    p.embeddedUser.handle = p.user;
    console.log('posts missing embeddedUser', p.embeddedUser.toObject());
    return p.save();
  });
  return Promise.all(posts);
}

async function updateUserEmbeds() {
  // Post.collection.dropIndex({ _id: 1, user: 1 });

  // const notifications = await Notification.find({});
  // notifications.forEach(n =>
  //   q.push(async cb => {
  //     n.byUsersHandle = n.byUsers;
  //     console.log(n.byUsersHandle.toObject());
  //     if (forUser === 'everyone') n.group = ['everyone'];
  //     await n.save();
  //     return cb();
  //   })
  // );

  const users = await User.find({ version: 'objectId' });
  users.forEach(async u => {
    console.log(u._id);
    // -------- POSTS ------------
    // q.push(async cb => {
    //   const posts = await Post.find({ user: u._id });
    //   console.log('found posts', u.handle, posts.length);

    //   await Post.update(
    //     { user: u.handle },
    //     { user: ObjectId(u._id), 'embeddedUser._id': u._id },
    //     { multi: true }
    //   );
    //   return cb();
    // });

    // -------- RELEVANCE ------------
    // q.push(async cb => {
    //   console.log(u._id);
    //   await Relevance.update(
    //     { user: u.handle },
    //     { user: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });

    // // -------- NOTIFICATIONS ------------
    // q.push(async cb => {
    //   // const notes = await Notification.find({ forUser: u.handle });
    //   // console.log('found notifications', u.handle, notes.length);

    //   await Notification.update(
    //     { forUser: u.handle },
    //     { forUser: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });
    // q.push(async cb => {
    //   await Notification.update(
    //     { byUser: u.handle },
    //     { byUser: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });
    // q.push(async cb => {
    //   await Notification.update(
    //     { byUsers: u.handle },
    //     { $set: { 'byUsers.$': ObjectId(u._id) } },
    //     { multi: true }
    //   );
    // });
    // q.push(async cb => {
    //   await Notification.update(
    //     { forUser: 'everyone' },
    //     { group: ['everyone'] },
    //     { multi: true }
    //   );
    //   return cb();
    // });


    // // -------- INVEST ------------
    // q.push(async cb => {
    //   await Invest.update(
    //     { investor: u.handle },
    //     { investor: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });

    // q.push(async cb => {
    //   await Invest.update(
    //     { author: u.handle },
    //     { author: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });

    // // -------- COMMUNITY MEMEBER ------------
    // q.push(async cb => {
    //   console.log(u._id);
    //   await CommunityMember.update(
    //     { user: u.handle },
    //     { user: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });

    // // -------- EARNINGS ------------
    // q.push(async cb => {
    //   console.log(u._id);
    //   await Earnings.update(
    //     { user: u.handle },
    //     { user: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });


    // // -------- SUBSCRIPTION ------------
    // q.push(async cb => {
    //   console.log(u._id);
    //   await Subscription.update(
    //     { follower: u.handle },
    //     { follower: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });

    // q.push(async cb => {
    //   console.log(u._id);
    //   await Subscription.update(
    //     { following: u.handle },
    //     { following: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });


    // // -------- STATISTICS ------------
    // q.push(async cb => {
    //   console.log(u._id);
    //   await Statistics.update(
    //     { user: u.handle },
    //     { user: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   cb();
    // });


    // // -------- INVEST ------------
    // q.push(async cb => {
    //   await Feed.update(
    //     { userId: u.handle },
    //     { userId: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });

    // q.push(async cb => {
    //   await Feed.update(
    //     { from: u.handle },
    //     { from: ObjectId(u._id) },
    //     { multi: true }
    //   );
    //   return cb();
    // });

    // -------- BLOCKED ------------
    q.push(async cb => {
      await User.update(
        { blocked: u.handle },
        { $set: { 'blocked.$': ObjectId(u._id) } },
        { multi: true }
      );
      return cb();
    });

    q.push(async cb => {
      await User.update(
        { blockedBy: u.handle },
        { $set: { 'blockedBy.$': ObjectId(u._id) } },
        { multi: true }
      );
      return cb();
    });
  });

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished queue');
  });
}

async function processEntity(entity) {
  try {
    entity.user = ObjectId(entity.user);
    entity.markModified('user');
    console.log('entity for ', entity.user);
    return null;
    // return entity.save();
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function convertStringToId() {
  // -------- POSTS ------------
  // let posts = await Post.find({ user: { $exists: true } });
  // posts = posts.map(p =>
  //   q.push(async cb => {
  //     console.log(p);
  //     await processEntity(post);
  //     return cb();
  //   })
  // );

  // -------- RELEVANCE ------------
  // let entities = await Relevance.find({ user: { $exists: true } });
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     await processEntity(entity);
  //     cb();
  //   })
  // );

  // -------- NOTIFICATIONS ------------
  let entities = await Notification.find({});
  entities = entities.map(entity =>
    q.push(async cb => {
      try {
        // if (entity.byUser) {
        //   entity.byUser = ObjectId(entity.byUser);
        //   entity.markModified('byUser');
        // }

        // if (entity.forUser) {
        //   entity.forUser = ObjectId(entity.forUser);
        //   entity.markModified('forUser');
        // }

        // entity.byUsers = entity.byUsers.toObject().map(u => ObjectId(u));
        // entity.markModified('byUsers');

        console.log(
          entity.byUser,
          entity.forUser,
          entity.byUsers.toObject(),
          entity.group.toObject()
        );
        // await entity.save();
        setTimeout(cb, 1);
      } catch (err) {
        console.log(err);
      }
    })
  );

  // -------- INVEST ------------
  // let entities = await Invest.find({});
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     try {
  //       console.log(entity.investor);
  //       if (entity.investor) {
  //         entity.investor = ObjectId(entity.investor);
  //         entity.markModified('investor');
  //       }

  //       console.log(entity.author);
  //       if (entity.author) {
  //         entity.author = ObjectId(entity.author);
  //         entity.markModified('author');
  //       }

  //       console.log(
  //         entity.investor,
  //         entity.author,
  //       );
  //       await entity.save();
  //       setTimeout(cb, 1);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   })
  // );


  // -------- COMMUNITY MEMBER ------------
  // let entities = await CommunityMember.find({ user: { $exists: true } });
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     await processEntity(entity);
  //     cb();
  //   })
  // );

  // -------- Earnings ------------
  // let entities = await Earnings.find({ user: { $exists: true } });
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     await processEntity(entity);
  //     cb();
  //   })
  // );

  // -------- SUBSCRIPTIONS ------------
  // let entities = await Subscription.find({});
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     console.log(entity.follower);
  //     if (entity.follower) {
  //       entity.follower = ObjectId(entity.follower);
  //       entity.markModified('follower');
  //     }

  //     console.log(entity.following);
  //     if (entity.following) {
  //       entity.following = ObjectId(entity.following);
  //       entity.markModified('author');
  //     }

  //     console.log(
  //       entity.following,
  //       entity.follower,
  //     );
  //     await entity.save();
  //     setTimeout(cb, 1);
  //     cb();
  //   })
  // );

  // -------- STATISTICS ------------
  // let entities = await Statistics.find({ user: { $exists: true } });
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     await processEntity(entity);
  //     cb();
  //   })
  // );


  // -------- FEED ------------
  // let entities = await Feed.find({});
  // entities = entities.map(entity =>
  //   q.push(async cb => {
  //     if (entity.userId) {
  //       entity.userId = ObjectId(entity.userId);
  //       entity.markModified('userId');
  //     }

  //     if (entity.from) {
  //       entity.from = ObjectId(entity.from);
  //       entity.markModified('from');
  //     }

  //     console.log(
  //       entity.userId,
  //       entity.from,
  //     );
  //     setTimeout(cb, 1);
  //     cb();
  //   })
  // );

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished queue');
  });
}

async function removeOldUsers() {
  // const users = await User.find({ version: 'stringID' });
  return User.remove({ version: 'stringID' }).exec();
}


async function udpatePostData() {
  await PostData.update(
    {},
    { isInFeed: false, hidden: false },
    { multi: true }
  );

  await Post.update(
    { type: 'link', parentPost: { $exists: false } },
    { hidden: true },
    { multi: true }
  );

  // await Post.update(
  //   { parentPost: { $exists: false }, type: 'link' },
  //   { hidden: true },
  //   { multi: true }
  // );

  const notHidden = await Post.find({ hidden: { $ne: true }, type: { $ne: 'comment' } })
  .populate({ path: 'data', select: 'isInFeed type repost' })
  .populate({
    path: 'parentPost',
    populate: [{
      path: 'data',
    },
    {
      path: 'metaPost'
    }]
  });
  console.log('notHidden', notHidden.length);

  notHidden.forEach((p, i) => {
    q.push(async cb => {
      const { communityId, type } = p;
      let { parentPost, data } = p;
      if (type === 'repost') {
        return console.log('idk', p.toObject());
      }

      // if (type !== 'post' && !parentPost) return console.log('missing parent', p.toObject());
      let parentData = parentPost ? parentPost.data : null;
      if (!data) data = await p.addPostData();
      if (parentPost && !parentData) parentData = await parentPost.addPostData();

      if (p.link && !p.url) {
        p.url = p.link;
        await p.save();
      }

      if (p.type === 'post' && !parentPost) {
        let linkObject = {};
        if (p.url) {
          let processed;
          if (!p.metaPost) {
            linkObject = await getLinkMetadata(p.url);
          }
          p = await p.upsertLinkParent(linkObject);
          parentPost = p.parentPost;
          parentData = parentPost.data;
          await p.save();
        }
      }

      if (parentPost) {
        const { metaPost } = parentPost;
        // TODO go to do image once
        if (!metaPost || !metaPost.url || !metaPost.title) {
          if (metaPost) console.log('incomplete metapost', metaPost.toObject());
          const url = p.url || parentPost.url;
          if (!url) console.log('missing url!');
          const linkObject = await getLinkMetadata(url);
          if (linkObject) {
            p = await p.upsertLinkParent({ ...linkObject, tags: p.tags });
            p = await p.save();
            parentPost = p.parentPost;
            console.log('new meta', parentPost.metaPost.toObject());
          }
        }

        parentPost.title = p.title;

        const updateTime = true;
        await parentPost.updateRank({ communityId, updateTime });
        parentPost.hidden = false;
        await parentPost.save();
      } else if (p.url) {
        console.log('NO PARENT ', p.type);
        console.log('', p.toObject());
      }

      if (!parentPost) {
        data.isInFeed = true;
        data.repost = p.type === 'repost' || false;
        data.type = p.type;
        data.hidden = p.hidden;
        if (!data.community) data.community = p.community;
        if (!data.communityId) data.communityId = p.communityId;
      } else {
        parentData.isInFeed = true;
        parentData.repost = p.type === 'repost' || false;
        parentData.hidden = p.hidden;
        parentData.type = p.type;
        parentData.parentPost = null;
        if (!parentData.community) parentData.community = p.community;
        if (!parentData.communityId) parentData.communityId = p.communityId;
        data.parentPost = parentPost._id;
      }

      if (p.title && p.title.match('BuzzFeed to Cut 15% of Its Workforce')) {
        console.log('post', p.title);
        console.log('parentData', parentData.toObject());
      }

      if (data) await data.save();
      if (parentData) await parentData.save();

      console.log(p.type, p.twitter, 'in feed', data.isInFeed);
      return setTimeout(cb, 1);
    });
  });


  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished queue');
  });
}

async function getLinkMetadata(url) {
  if (!url) return null;
  const noReadability = true;
  const processed = await previewDataAsync(
    url,
    noReadability
  );
  return {
    title: processed.title,
    url: processed.url,
    description: processed.description,
    image: processed.image,
    articleAuthor: processed.articleAuthor,
    domain: processed.domain,
    keywords: processed.keywords,
    // TODO we are not using this
    shortText: processed.shortText,
  };
}

async function fixMessedUpPost() {
  let posts = await Post.update(
    {
      twitter: true,
      hidden: { $ne: false }
    },
    { hidden: true },
    { multi: true }
  );

  posts = await Post.update(
    {
      twitter: true,
      relevance: { $gt: 0 }
    },
    { hidden: false },
    { multi: true }
  );

  posts = await Post.count({
    twitter: true,
    hidden: { $ne: true },
    // relevance: { $gt: 0 } }
  });
  console.log('not hidden twitter posts', posts);
  return posts;
}

let page = 0;
const limit = 1000;
async function removeEmptyTwitterParents() {
  const total = await Post.count({
    parentPost: { $exists: false },
    hidden: false,
    type: 'link',
    twitter: { $ne: true }
  });
  console.log('total posts', total);

  const posts = await Post.find({
    parentPost: { $exists: false },
    hidden: false,
    twitter: { $ne: true }
  },
  'title url embeddedUser type twitter parentPost community postDate hidden')
  .populate({ path: 'children', select: '_id twitter relevance' })
  .skip(page * limit)
  .limit(limit);
  page++;

  console.log('total', page * limit);
  posts.forEach((p, i) => {
    q.push(async cb => {
      if (!p.children.length) {
        console.log(p.toObject());
        const remove = await p.remove();
      } else {
        const notTW = p.children.filter(c => !c.twitter || c.relevance > 0);
        if (notTW.length) {
          console.log('post has children', notTW.length);
        }
      }
      if (i === limit - 1) removeEmptyTwitterParents();
      return setTimeout(cb, 1);
    });
  });

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished queue');
  });
}

async function addTagsToData() {
  const postData = await PostData.find({ isInFeed: true })
  .populate('post');
  const updated = postData.map(pd => {
    pd.tags = pd.post.tags;
    return pd.save();
  });
  return Promise.all(updated);
}

async function runUpdates() {
  try {
    const dc = await Community.findOne({ slug: DEFAULT_COMMINITY });
    DEFAULT_COMMINITY_ID = dc._id;

    // await populateCommunityEmbeddedUsuer();
    // console.log(await updateMemberCount());

    // TODO clean up PostData left over from tests
    // await cleanupPostData();


    // await updateUserIdType();
    // await convertIdToObject();

    // await checkEmbeddedUser();

    // await updateUserEmbeds();
    // await convertStringToId();

    // await removeOldUsers();

    // checkMessedUpPost(); // shouldn't be necessary
    // await removeEmptyTwitterParents();
    // await udpatePostData();

    // await addTagsToData();

    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
