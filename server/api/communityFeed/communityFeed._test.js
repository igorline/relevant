// import { test, request } from 'server/config/ava.config';
// import { setupData, cleanupData } from 'server/config/test_seed';

// let r;
// let token;
// let authorToken;
// let postId;
// let savedPost;

// function getPostObj() {
//   const now = new Date();
//   return {
//     link:
//       'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
//     body: 'Hotties',
//     title: 'Test post title',
//     description: 'Test post description',
//     image:
//       'https://static.boredpanda.com/blog/wp-content/uploads/2016/08/cute-kittens-30-57b30ad41bc90__605.jpg',
//     tags: ['tag1', 'tag2'],
//     category: { _id: 'testCat' },
//     payoutTime: now
//   };
// }

// function getUpvoteObj(id) {
//   return {
//     post: { _id: id },
//     amount: 1
//   };
// }

// test.before(async () => {
//   const { app } = require('server/server.js');
//   r = request(app);
//   // just in case
//   await cleanupData();
//   await setupData(['crypto']);
// });

// test.after(async () => {
//   await cleanupData();
// });

// test.serial('Community Create Post', async t => {
//   t.plan(3);

//   const res = await r
//   .post('/auth/local?community=crypto')
//   .send({ name: 'dummy1', password: 'test' });

//   authorToken = res.body.token;

//   const newPost = await r
//   .post(`/api/post?access_token=${authorToken}&community=crypto`)
//   .send(getPostObj());

//   postId = newPost.body._id;
//   savedPost = newPost.body;

//   t.truthy(savedPost.postDate);

//   t.is(newPost.status, 200, 'should get correct server response');
//   t.is(savedPost.community, 'crypto', 'push should have correct community');
// });

// test.serial('Upvote 1', async t => {
//   t.plan(2);

//   const login = await r
//   .post('/auth/local?community=crypto')
//   .send({ name: 'test', password: 'test' });

//   token = login.body.token;

//   t.is(login.status, 200, 'should get correct server response');

//   const upvote = await r
//   .post(`/api/invest?access_token=${token}&community=crypto`)
//   .send(getUpvoteObj(postId));

//   t.is(upvote.status, 200, 'should get correct server response');
// });

// test.serial('Upvote 2', async t => {
//   t.plan(2);

//   const login = await r
//   .post('/auth/local?community=crypto')
//   .send({ name: 'slava', password: 'slava' });

//   token = login.body.token;
//   t.is(login.status, 200);

//   const upvote = await r
//   .post(`/api/invest?access_token=${token}&community=crypto`)
//   .send(getUpvoteObj(postId));

//   t.is(upvote.status, 200, 'should get correct server response');
// });

// test.serial('Community Get Feed', async t => {
//   t.plan(6);

//   const res = await r.get('/api/communityFeed?community=crypto');

//   t.is(res.status, 200, 'should not return error');
//   t.truthy(res.body.length, 'there should be a feed');

//   const post = res.body[0].commentary[0];

//   t.is(post._id, postId, 'new post should be first one in the feed');
//   t.true(res.body[0].rank > 0, 'rank should be bigger than 0 after upvote');
//   t.truthy(post.embeddedUser.relevance.relevance, 'should populate user relevance');

//   // user is populated
//   t.is(post.embeddedUser.handle, 'dummy1');
// });

// test.serial('Should get author relevance correctly', async t => {
//   t.plan(3);

//   const res = await r.get('/api/user/user/dummy1?community=crypto');

//   t.is(res.status, 200, 'should get correct server response');
//   t.truthy(res.body);
//   t.is(res.body.relevance, 2, 'user relevance should be 2');
// });

// test.serial('Should get voter relevance correctly', async t => {
//   t.plan(3);

//   const res = await r.get('/api/user/user/dummy2?community=crypto');

//   t.is(res.status, 200, 'should get correct server response');
//   t.truthy(res.body);
//   t.is(res.body.relevance, 1, 'voter relevance should be 1');
// });

// test.serial('Delete post', async t => {
//   t.plan(1);

//   const res = await r.delete(
//     `/api/post/${postId}?access_token=${authorToken}&community=crypto`
//   );

//   t.is(res.status, 200, 'should get correct server response');
// });

// test.serial('Make sure post is removed from feed', async t => {
//   t.plan(2);

//   const res = await r.get('/api/communityFeed?community=crypto');
//   t.is(res.status, 200, 'should get correct server response');
//   if (res.body.length > 0) {
//     // console.log('post parent', res.body[0]);
//     t.not(res.body[0].commentary[0]._id, postId);
//   } else {
//     t.falsy(res.body.length);
//   }
// });
