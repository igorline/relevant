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
    payoutTime: now
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
  // await cleanupData();
});

test.serial('Community Create Post', async (t) => {
  t.plan(2);

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

  t.is(newPost.status, 200);
  t.is(savedPost.community, 'crypto');
});

test.serial('Community Create Post', async (t) => {
  t.plan(4);

  const res = await r
  .get('/api/communityFeed')
  .set('Host', 'crypto.localhost:3000');

  t.is(res.status, 200);
  t.truthy(res.body.length);
  t.is(res.body[0].commentary[0]._id, postId);

  // user is populated
  t.is(res.body[0].commentary[0].user._id, 'dummy1');
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

