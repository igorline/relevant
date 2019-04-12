import mongoose from 'mongoose';
import Post from 'server/api/post/post.model';
import CommunityMember from 'server/api/community/community.member.model';
import User from 'server/api/user/user.model';
import PostData from 'server/api/post/postData.model';
import Community from 'server/api/community/community.model';
import Relevance from 'server/api/relevance/relevance.model';
import Notification from 'server/api/notification/notification.model';
import Invest from 'server/api/invest/invest.model';
import Invite from 'server/api/invites/invite.model';
import Earnings from 'server/api/earnings/earnings.model';
import Subscription from 'server/api/subscription/subscription.model';
import Statistics from 'server/api/statistics/statistics.model';
import Feed from 'server/api/feed/feed.model';
import Treasury from 'server/api/treasury/treasury.model';
import { previewDataAsync } from 'server/api/post/post.controller';

const { ObjectId } = mongoose.Types;

const queue = require('queue');

const q = queue({
  concurrency: 1
});

// TODO update post embedded user to _id
// user check handle?
const DEFAULT_COMMINITY = 'relevant';
let DEFAULT_COMMINITY_ID;

/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */
/* eslint max-len: 0 */

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
      // let posts = await Post.find({ user: u._id });
      // console.log('found posts', u.handle, posts.length);

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
      return cb();
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
      return cb();
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

    // -------- INVITES ------------
    q.push(async cb => {
      await Invite.update(
        { invitedBy: u.handle },
        { invitedBy: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });

    q.push(async cb => {
      await Invite.update(
        { registeredAs: u.handle },
        { registeredAs: ObjectId(u._id) },
        { multi: true }
      );
      return cb();
    });

    q.push(async cb => {
      await Invite.update(
        { invitee: u.handle },
        { invitee: ObjectId(u._id) },
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
  .populate({
    path: 'data',
    match: { community },
    select: 'isInFeed type repost relevance pagerank'
  })
  .populate({
    path: 'parentPost',
    populate: [
      {
        path: 'data',
        match: { community }
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
        parentData.relevance = Math.max(p.data.relevance, parentData.relevance) || 0;
        parentData.pagerank = Math.max(p.data.pagerank, parentData.pagerank) || 0;
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

async function addTagsToData() {
  const postData = await PostData.find({ isInFeed: true }).populate('post');
  const updated = postData.map(pd => {
    pd.tags = pd.post.tags;
    return pd.save();
  });
  return Promise.all(updated);
}

async function makeSurePostHaveCommunityId() {
  await PostData.update(
    { community: DEFAULT_COMMINITY, communityId: { $exists: false } },
    { communityId: DEFAULT_COMMINITY_ID },
    { multi: true }
  );
  return Post.update(
    { community: DEFAULT_COMMINITY, communityId: { $exists: false } },
    { communityId: DEFAULT_COMMINITY_ID },
    { multi: true }
  );
}

// async function cleanInvites() {
//   let invites = await Invite.find({});
//   invites = invites.map(i => {
//     try {
//       ObjectId(i.registeredAs);
//       return null;
//     } catch (err) {
//       console.log(i.toObject());
//       return i.remove();
//     }
//   });
//   return Promise.all(invites);
// }

async function userTokens() {
  // let users = await User.find({});
  // users = users.map(u => {
  //   u.tokenBalance = 0;
  //   return u.save();
  // });

  const users = await User.find({});
  let totalTokens = 0;
  users.forEach(u => {
    // console.log(u.handle, u.balance);
    totalTokens += u.balance || 0;
  });
  console.log('totalTokens', totalTokens);

  const treasury = await Treasury.findOne({});
  console.log(treasury.toObject());
}

async function cleanUpCommunityFunds() {
  const communities = await Community.find({});
  communities.map(
    c =>
      // eslint-disable-line
      // console.log(c.toObject());
      console.log(c.slug, c.rewardFund)
    // c.rewardFund = 0;
    // c.topPostShares = 0;
    // c.currentPosts = 0;
    // c.postCount = 0;
    // c.currentShares = 0;
    // return c.save();
  );
}

async function restoreRewards() {
  const fixDate = new Date('March 11, 2019 19:00:00');

  const launchDate = new Date('March 5, 2019 12:00:00');
  const rewards = await Earnings.find({
    status: 'paidout',
    createdAt: { $gt: launchDate }
  })
  .populate('user')
  .populate('post')
  .sort('createdAt');
  rewards.forEach(async r => {
    // r.user.balance += r.earned;
    // await r.user.save();
    console.log(r.user.handle, r.user.balance);
    console.log('rewards', r.user.handle, r.post.title, r.earned, r.payoutTime);
  });
}

// async function notificationCheck() {
//   const launchDate = new Date('March 5, 2019 12:00:00');
//   let replies = await Post.find({
//     parentComment: { $exists: true },
//     createdAt: { $gt: launchDate }
//   })
//   .populate('parentComment');

//   console.log('found', replies.length, 'replies');

//   replies = replies.map(async reply => {
//     const { parentComment } = reply;
//     if (!parentComment) return console.log('missing parent comment', reply._id);
//     const author = reply.parentComment.user;
//     if (author.toString() === reply.user.toString()) return console.log('comment on own post');
//     const authorNote = await Notification.findOne({
//       forUser: author,
//       byUser: { $ne: author },
//       post: reply._id,
//       type: 'comment',
//     });
//     if (!authorNote) {
//       console.log('missing notification',
//         reply.parentComment.embeddedUser.handle,
//         reply.parentComment.body,
//         reply.embeddedUser.handle,
//         reply.body
//       );

//       const dbNotificationObj = {
//         // post: reply.parentPost || reply._id,
//         post: reply._id,
//         forUser: author,
//         byUser: reply.user,
//         amount: null,
//         type: 'comment',
//         source: 'comment',
//         personal: true,
//         read: false
//       };

//       const newDbNotification = new Notification(dbNotificationObj);

//       console.log(newDbNotification.toObject());
//       const note = await newDbNotification.save();
//     } else {
//       console.log('note exists');
//     }
//   });
// }

// async function fixOldComment() {
//   const comments = await Post.find({
//     hidden: { $ne: true },
//     type: 'comment',
//     parentComment: { $exists: false }
//   })
//   .populate('parentPost');

//   comments.map(c => {
//     // console.log(c.parentPost.toObject());
//     const { parentPost } = c.parentPost || {};
//     if (c.parentPost && parentPost && !parentPost.equals(c.parentPost._id)) {
//       c.parentComment = c.parentPost._id;
//       c.parentPost = parentPost;
//       // return c.save();
//       // console.log(c.createdAt, c.parentPost, c.parentComment);
//     } else return console.log('no nested parent');
//   });
// }

async function unlockTokens() {
  const earnings = await Earnings.find({ status: 'expired' }).populate('user');
  earnings.map(e => {
    console.log(
      'stakedTokens',
      e.stakedTokens,
      'lockedTokens',
      e.user.lockedTokens,
      '/',
      e.user.balance
    );
    e.user.lockedTokens = Math.max(e.user.lockedTokens - e.stakedTokens, 0);
    console.log(e.user.handle, e.user.lockedTokens);
    // return e.user.save();
    return null;
  });
}

async function checkDiscreptancies() {
  const posts = [
    '5c96af25d22d6400173051e3',
    '5c9d027c7142ae0017fc6e7f',
    '5ca0c055a103f700171ba63e'
  ];
  let earnings = [
    '5c96b4c3c7a4c49170bbff19',
    '5c9e290ac7a4c49170bc10b5',
    '5ca0d293c7a4c49170bc18c6'
  ];

  earnings = await Earnings.find({ _id: { $in: earnings } });
  earnings.forEach(e => console.log(e.toObject()));

  const invest = await Invest.find({ post: '5c96af25d22d6400173051e3' });
  invest.forEach(inv => console.log(inv.toObject()));
}

async function auditUserEarnings() {
  const users = await User.find({ balance: { $gt: 0 } });
  users.forEach(userEarnings);
}

async function userEarnings(user) {
  // fixes:
  // JTremback 411.83630209978696 newRewards: 402.75574879734654 legacyRewards: 0 spent 0
  // diff -30.91944669755958
  // georgerobescu 3835.70433694349 newRewards: 4074.802808079461 legacyRewards: 0 spent 0
  // diff -279.09847113597107
  // colin_ 4425.404513377224 newRewards: 4787.5690062576095 legacyRewards: 0 spent 0
  // diff -402.1644928803853
  // crookedycrook 2047.235391487282 newRewards: 2050.400805880663 legacyRewards: 0 spent 0
  // diff -43.16541439338107
  // villecallio 55213.50792373421 newRewards: 58264.18821834823 legacyRewards: 0 spent 0
  // diff -3090.6802946140233
  // springbreak1944 1865.2674163439851 newRewards: 2685.252134268827 legacyRewards: 0 spent 0
  // diff -899.9847179248418
  // clayt0nk 394.8603272404622 newRewards: 389.3497144288439 legacyRewards: 0 spent 0
  // diff -34.48938718838173

  // mabodxbs 52.096513729057946 newRewards: 3.148890852758136 legacyRewards: 68.17836358911259 spent 0
  // diff -19.230740712812782
  // adjust 0
  // billy 3865.8852669757484 newRewards: 3823.2718166646623 legacyRewards: 1663.345263693809 spent 30
  // diff -1590.731813382723
  // adjust 0
  // tarrence 897.5184240352796 newRewards: 72.23239763241934 legacyRewards: 896.0726527636831 spent 20
  // diff -50.786626360822765
  // adjust 0
  // chablasco 17334.268517287957 newRewards: 26314.95970548867 legacyRewards: 3073.35779673077 spent 1139
  // diff -10915.048984931482
  // adjust 10653.311945209545
  // taylore 118996.50968547608 newRewards: 129411.91132599983 legacyRewards: 5447.708494227554 spent 2958
  // diff -12905.110134751303
  // adjust 25788.457108452014
  // Analisa 32438.840429087475 newRewards: 24543.494367419247 legacyRewards: 17283.721651399803 spent 8720
  // diff -688.375589731575
  // adjust 5367.287941299241
  // JonasWendelin 4988.978088377439 newRewards: 3794.3548798420047 legacyRewards: 3207.0419701062783 spent 2010
  // diff -2.418761570843799
  // adjust 257.45458810645675
  // jonomilo 4370.413483762431 newRewards: 282.0657247447491 legacyRewards: 10290.658636368484 spent 4837
  // diff -1365.310877350802
  // adjust 0
  // slava 62210.237061590844 newRewards: 58077.85648162087 legacyRewards: 18131.02582865553 spent 9466
  // diff -4657.645248685552
  // adjust 1347.8734770611138
  // mrcni 14929.65441736284 newRewards: 10348.289513708638 legacyRewards: 11127.827020153503 spent 5833
  // diff -713.4621164993005
  // adjust 0

  const posts = [
    '5c96af25d22d6400173051e3', // spb, george, ville
    '5c9d027c7142ae0017fc6e7f', // jehan, spb, george
    '5ca0c055a103f700171ba63e', // spb
    '5c9a45a2263807001718357e', // clayton
    '5c9a68962638070017183619', // crook
    '5c8558fded171e0017070088' // ville
  ];

  const earnigns = await Earnings.find({ user: user._id, status: 'paidout' });
  let total = 0;

  earnigns.forEach(e => {
    total += e.earned;
  });
  // user.legacyTokens = legacy - spent;
  // await user.save();
  const diff =
    user.balance +
    user.tokenBalance -
    user.airdropTokens -
    total -
    user.legacyTokens -
    user.legacyAirdrop;
  if (Math.abs(diff) > 0.000001) {
    console.log('error! earnings mismatch');
    console.log(
      user.handle,
      user.balance,
      'newRewards:',
      total,
      'legacyRewards:',
      user.legacyTokens
    );
    console.log('diff', diff);
    // user.balance -= diff;
    // await user.save();
  }
}

async function runUpdates() {
  try {
    const dc = await Community.findOne({ slug: DEFAULT_COMMINITY });
    DEFAULT_COMMINITY_ID = dc._id;

    // await makeSurePostHaveCommunityId();
    // await updateUserIdType();

    // await updateUserEmbeds();

    // await checkHiddenPosts();
    // await updatePostData('relevant');
    // await updatePostData('crypto');
    // await addTagsToData();

    // await populateCommunityEmbeddedUsuer();
    // await updateMemberCount();

    // await removeOldUsers();

    // await cleanInvites();

    // await userTokens();
    // await cleanUpCommunityFunds();

    // await restoreRewards();

    // notification check
    // await notificationCheck();

    // await fixOldComment();

    // await unlockTokens();

    // await checkDiscreptancies();
    await auditUserEarnings();

    console.log('finished db updates');
  } catch (err) {
    console.log(err);
  }
}

runUpdates();
