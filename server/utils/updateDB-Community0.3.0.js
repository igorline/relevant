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
  let members = await CommunityMember.find({
    'embeddedUser.handle': { $exists: false }
  }).populate('user', 'name handle image');
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
  let users = await User.find(
    {},
    `
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

async function updateUserEmbeds() {
  const users = await User.find({ version: 'objectId' });
  users.forEach(async u => {
    console.log(u._id);
    // -------- POSTS ------------
    q.push(async cb => {
      const posts = await Post.find({ user: u._id });
      console.log('found posts', u.handle, posts.length);

      await Post.update(
        { user: u.handle },
        {
          user: ObjectId(u._id),
          'embeddedUser._id': u._id,
          'embeddedUser.handle': u.handle,
          'embeddedUser.name': u.name,
          'embeddedUser.image': u.image
        },
        { multi: true }
      );
      return cb();
    });

    // -------- RELEVANCE ------------
    q.push(async cb => {
      console.log(u._id);
      await Relevance.update(
        { user: u.handle },
        { user: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    // -------- NOTIFICATIONS ------------
    q.push(async cb => {
      // const notes = await Notification.find({ forUser: u.handle });
      // console.log('found notifications', u.handle, notes.length);

      await Notification.update(
        { forUser: u.handle },
        { forUser: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });
    q.push(async cb => {
      await Notification.update(
        { byUser: u.handle },
        { byUser: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });
    q.push(async cb => {
      await Notification.update(
        { byUsers: u.handle },
        { $set: { 'byUsers.$': ObjectId(u._id) } },
        { multi: true }
      );
    });
    q.push(async cb => {
      await Notification.update(
        { forUser: 'everyone' },
        { group: ['everyone'] },
        { multi: true }
      );
      return cb();
    });
    const notifications = await Notification.find({});
    notifications.forEach(n =>
      q.push(async cb => {
        n.byUsersHandle = n.byUsers;
        await n.save();
        return cb();
      })
    );

    // -------- INVEST ------------
    q.push(async cb => {
      await Invest.update(
        { investor: u.handle },
        { investor: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });

    q.push(async cb => {
      await Invest.update(
        { author: u.handle },
        { author: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });

    // -------- COMMUNITY MEMEBER ------------
    q.push(async cb => {
      console.log(u._id);
      await CommunityMember.update(
        { user: u.handle },
        { user: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    // -------- EARNINGS ------------
    q.push(async cb => {
      console.log(u._id);
      await Earnings.update(
        { user: u.handle },
        { user: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    // -------- SUBSCRIPTION ------------
    q.push(async cb => {
      console.log(u._id);
      await Subscription.update(
        { follower: u.handle },
        { follower: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    q.push(async cb => {
      console.log(u._id);
      await Subscription.update(
        { following: u.handle },
        { following: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    // -------- STATISTICS ------------
    q.push(async cb => {
      console.log(u._id);
      await Statistics.update(
        { user: u.handle },
        { user: ObjectId(u._id) },
        { multi: true }
      );
      cb();
    });

    // -------- INVEST ------------
    q.push(async cb => {
      await Feed.update(
        { userId: u.handle },
        { userId: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });

    q.push(async cb => {
      await Feed.update({ from: u.handle }, { from: ObjectId(u._id) }, { multi: true });
      return cb();
    });

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

  return new Promise((resolve, reject) => {
    q.start((queErr, results) => {
      if (queErr) return reject(queErr);
      return resolve('finished queue');
    });
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

async function removeOldUsers() {
  // const users = await User.find({ version: 'stringID' });
  return User.remove({ version: 'stringID' }).exec();
}

async function checkHiddenPosts() {
  await Post.update(
    { hidden: { $exists: false }, type: 'post', twitter: true, relevance: { $eq: 0 } },
    { hidden: true },
    { multi: true }
  );
}

async function updatePostData(community) {
  await PostData.update(
    { community },
    { isInFeed: false, hidden: true },
    { multi: true }
  );

  await Post.update(
    { type: 'link', parentPost: { $exists: false }, community },
    { hidden: true },
    { multi: true }
  );

  const notHidden = await Post.find({
    hidden: { $ne: true },
    type: { $in: ['post', 'repost'] },
    community
  })
  .populate({ path: 'data', match: { community }, select: 'isInFeed type repost' })
  .populate({
    path: 'parentPost',
    populate: [
      {
        path: 'data'
      },
      {
        path: 'metaPost'
      }
    ]
  });
  console.log('notHidden', notHidden.length);

  notHidden.forEach((p, i) => {
    q.push(async cb => {
      const { communityId, type } = p;
      let { parentPost, data } = p;

      let start = new Date();
      let parentData = parentPost ? parentPost.data : null;
      if (!data) data = await p.addPostData();
      if (parentPost && !parentData) parentData = await parentPost.addPostData();

      if (p.link && !p.url) {
        p.url = p.link;
        p = await p.save();
      }
      console.log('add post data', (new Date().getTime() - start.getTime()) / 1000 + 's');
      start = new Date();

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
      console.log(
        'check/upsert parent',
        (new Date().getTime() - start.getTime()) / 1000 + 's'
      );
      start = new Date();

      let metaPost;
      if (parentPost) {
        metaPost = parentPost.metaPost;

        const url = p.url || parentPost.url;
        if (url && (!metaPost || !metaPost.url || !metaPost.title)) {
          // if (metaPost) console.log('incomplete metapost', metaPost.toObject());
          const linkObject = await getLinkMetadata(url);
          if (linkObject) {
            p = await p.upsertLinkParent({ ...linkObject, tags: p.tags.toObject() });
            p = await p.save();
            parentPost = p.parentPost;
            // console.log('new meta', parentPost.metaPost.toObject());
          }
        }

        parentPost.title = p.title;

        const updateTime = true;
        parentPost = await parentPost.updateRank({ communityId, updateTime });
        parentPost.hidden = false;
        parentPost = await parentPost.save();
      } else if (p.url) {
        console.log('NO PARENT ', p.type);
      }
      console.log('metapost', (new Date().getTime() - start.getTime()) / 1000 + 's');
      start = new Date();

      if (!parentPost) {
        data.isInFeed = true;
        data.repost = p.type === 'repost' || false;
        data.type = p.type;
        data.hidden = p.hidden;
        p.relevance = data.relevance;
        if (!data.community) data.community = p.community;
        if (!data.communityId) data.communityId = p.communityId;
      } else {
        parentData = parentPost.data;
        parentData.isInFeed = true;
        parentData.repost = p.type === 'repost' || false;
        parentData.hidden = p.hidden;
        parentData.type = p.type;
        parentData.parentPost = null;
        parentPost.relevance = parentData.relevance;
        if (!parentData.community) parentData.community = p.community;
        if (!parentData.communityId) parentData.communityId = p.communityId;
        data.parentPost = parentPost._id;
        if (metaPost) {
          parentPost.image = metaPost.image;
          p.image = metaPost.image;
        }
      }

      if (data) await data.save();
      if (parentData) await parentData.save();
      console.log('save', (new Date().getTime() - start.getTime()) / 1000 + 's');

      console.log(i, p.type, p.twitter, 'in feed', data.isInFeed);
      return setTimeout(cb, 1);
    });
  });

  return new Promise((resolve, reject) => {
    q.start((queErr, results) => {
      if (queErr) return reject(queErr);
      return resolve('finished queue');
    });
  });
}

async function getLinkMetadata(url) {
  try {
    if (!url) return null;
    const noReadability = true;
    const processed = await previewDataAsync(url, noReadability);
    return {
      title: processed.title,
      url: processed.url,
      description: processed.description,
      image: processed.image,
      articleAuthor: processed.articleAuthor,
      domain: processed.domain,
      keywords: processed.keywords,
      // TODO we are not using this
      shortText: processed.shortText
    };
  } catch (err) {
    console.log(err);
    return null;
  }
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
    hidden: { $ne: true }
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

  const posts = await Post.find(
    {
      parentPost: { $exists: false },
      hidden: false,
      twitter: { $ne: true }
    },
    'title url embeddedUser type twitter parentPost community postDate hidden'
  )
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

  return new Promise((resolve, reject) => {
    q.start((queErr, results) => {
      if (queErr) return reject(queErr);
      return resolve('finished queue');
    });
  });
}

async function addTagsToData() {
  const postData = await PostData.find({ isInFeed: true }).populate('post');
  const updated = postData.map(pd => {
    pd.tags = pd.post.tags;
    return pd.save();
  });
  return Promise.all(updated);
}

async function checkEmbeddedUser() {
  let posts = await Post.find({
    embeddedUser: { $exists: true },
    twitter: { $ne: true },
    // eslint-disable-next-line
    $where: function() {
      return (
        this.user !== this.embeddedUser._id ||
        !this.embeddedUser.handle ||
        !this.embeddedUser.name
      );
    }
  }).populate('user');
  posts = posts.map(p => {
    if (!p.user) return console.log('post is missing user', p.toObject());
    p.embeddedUser.handle = p.user.handle;
    p.embeddedUser._id = p.user._id;
    p.embeddedUser.name = p.user.name;

    console.log('posts missing embeddedUser', p.embeddedUser.toObject());
    return p.save();
  });
  return Promise.all(posts);
}

async function runUpdates() {
  try {
    const dc = await Community.findOne({ slug: DEFAULT_COMMINITY });
    DEFAULT_COMMINITY_ID = dc._id;

    // await updateUserIdType();

    // await updateUserEmbeds();

    // await checkHiddenPosts();
    // await updatePostData('relevant');
    // await updatePostData('crypto');
    // await addTagsToData();

    // await populateCommunityEmbeddedUsuer();
    // await updateMemberCount();

    // await removeOldUsers();

    // DON'T NEED
    // await cleanupPostData();
    // await convertIdToObject();
    // await removeEmptyTwitterParents();

    // GE RID OF
    // checkMessedUpPost(); // shouldn't be necessary

    // await checkEmbeddedUser();
    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

// runUpdates();
