import test from 'ava';

import { setupData, cleanupData, dummyUsers } from '../../config/test_seed';

let request = require('supertest');

process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');

let r;
let token;
let authorToken;
let postId;
let savedPost;

function getPostObj() {
  let now = new Date();
  return {
    link: 'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
    body: 'Hotties',
    title: 'Test post title',
    description: 'Test post description',
    image: 'https://static.boredpanda.com/blog/wp-content/uploads/2016/08/cute-kittens-30-57b30ad41bc90__605.jpg',
    tags: ['tag1', 'tag2'],
    category: { _id: 'testCat' },
    payoutTime: now,
  };
}

function getUpvoteObj(id) {
  return {
    post: { _id: id },
    amount: 1
  };
}


test.before(async () => {
  let app = require('../../server.js').app;
  r = request(app);
  // just in case
  await cleanupData();
  await setupData();
});

test.after(async () => {
  await cleanupData();
});

test.serial('Community Create Post', async (t) => {
  t.plan(3);

  const res = await r
  .post('/auth/local')
  .set('Host', 'crypto.localhost:3000')
  .send({ name: 'dummy1', password: 'test' });

  authorToken = res.body.token;

  const newPost = await r
  .post(`/api/post?access_token=${authorToken}`)
  .set('Host', 'crypto.localhost:3000')
  .send(getPostObj());

  postId = newPost.body._id;
  savedPost = newPost.body;

  t.truthy(savedPost.postDate);

  t.is(newPost.status, 200);
  t.is(savedPost.community, 'crypto');
});

test.serial('Upvote 1', async (t) => {
  t.plan(2);

  const login = await r
  .post('/auth/local')
  .set('Host', 'crypto.localhost:3000')
  .send({ name: 'dummy2', password: 'test' });

  token = login.body.token;

  t.is(login.status, 200);

  const upvote = await r
  .post(`/api/invest?access_token=${token}`)
  .set('Host', 'crypto.localhost:3000')
  .send(getUpvoteObj(postId));

  t.is(upvote.status, 200);
});

test.serial('Upvote 2', async (t) => {
  t.plan(2);

  const login = await r
  .post('/auth/local')
  .set('Host', 'crypto.localhost:3000')
  .send({ name: 'dummy3', password: 'test' });

  token = login.body.token;
  t.is(login.status, 200);

  const upvote = await r
  .post(`/api/invest?access_token=${token}`)
  .set('Host', 'crypto.localhost:3000')
  .send(getUpvoteObj(postId));

  t.is(upvote.status, 200);
});


test.serial('Community Get Feed', async (t) => {
  t.plan(6);

  const res = await r
  .get('/api/communityFeed')
  .set('Host', 'crypto.localhost:3000');

  t.is(res.status, 200, 'should not return error');
  t.truthy(res.body.length, 'there should be a feed');

  let post = res.body[0].commentary[0];

  t.is(post._id, postId, 'new post should be first one in the feed');
  t.true(res.body[0].rank > 0, 'rank should be bigger than 0 after upvote');
  t.truthy(post.embeddedUser.relevance.relevance, 'should populate user relevance');

  console.log(post.embeddedUser);
  // user is populated
  t.is(res.body[0].commentary[0].user, 'dummy1');
});

test.serial('Should get author relevance correctly', async (t) => {
  t.plan(3);

  const res = await r
  .get('/api/user/user/dummy1')
  .set('Host', 'crypto.localhost:3000');

  t.is(res.status, 200);
  t.truthy(res.body);
  t.is(res.body.relevance, 2, 'user relevance should be 2');
});

test.serial('Should get voter relevance correctly', async (t) => {
  t.plan(3);

  const res = await r
  .get('/api/user/user/dummy2')
  .set('Host', 'crypto.localhost:3000');

  t.is(res.status, 200);
  t.truthy(res.body);
  t.is(res.body.relevance, 1, 'voter relevance should be 1');
});

test.serial('Delete post', async (t) => {
  t.plan(1);

  const res = await r
  .delete(`/api/post/${postId}?access_token=${authorToken}`);

  t.is(res.status, 200);
});

test.serial('Make sure post is removed from feed', async (t) => {
  t.plan(2);

  const res = await r
  .get('/api/communityFeed')
  .set('Host', 'crypto.localhost:3000');

  t.is(res.status, 200);
  if (res.body.length > 0) {
    t.not(res.body[0].commentary[0]._id, postId);
  } else {
    t.falsy(res.body.length);
  }
});

