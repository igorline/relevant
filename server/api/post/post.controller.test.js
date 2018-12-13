import test from 'ava';
import { setupData, cleanupData, dummyUsers } from '../../config/test_seed';

const request = require('supertest');

process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');
process.env.WEB = 'true';

let r;
let token;
let authorToken;
let postId;
let savedPost;

function getPostObj() {
  const now = new Date();
  return {
    url: 'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
    body: 'Hotties',
    title: 'Test post title',
    description: 'Test post description',
    image: 'https://static.boredpanda.com/blog/wp-content/uploads/2016/08/cute-kittens-30-57b30ad41bc90__605.jpg',
    tags: ['tag1', 'tag2'],
    payoutTime: now
  };
}

test.before(async () => {
  const app = require('../../server.js').app;
  r = request(app);

  require('dotenv').config({ silent: true });

  // just in case
  await cleanupData();
  await setupData();
});

test.after(async () => {
  await cleanupData();
});

test('post:Index', async t => {
  t.plan(2);

  const res = await r
    .get('/api/post');

  const array = res.body instanceof Object;
  t.is(res.status, 200, 'Return correct status');
  t.is(array, true, 'Return array/object');
});


// test('Create post without being logged in', async t => {
//   t.plan(1);
//   const res = await r
//   .post('/api/post');
//   t.is(res.status, 500, 'Should not be able to creat new post if not logged in');
// });


test.serial('Create Post', async (t) => {
  t.plan(5);
  const postObject = getPostObj();

  const res = await r
    .post('/auth/local')
    .send({ name: 'dummy1', password: 'test' });

  authorToken = res.body.token;

  t.is(res.status, 200);
  t.truthy(authorToken, 'Token should not be null');

  const newPost = await r
    .post(`/api/post?access_token=${authorToken}`)
    .send(postObject);

  postId = newPost.body._id;
  savedPost = newPost.body;

  t.is(newPost.status, 200);

  const post = await r
    .get('/api/post/' + postId);

  t.is(res.status, 200);

  const correctMetapost = Object.keys(postObject).every(key => {
    if (key === 'body' || key === 'payoutTime') {
      return JSON.stringify(postObject[key]) === JSON.stringify(post.body[key]);
    }
    return JSON.stringify(postObject[key]) === JSON.stringify(post.body.metaPost[key]);
  });

  t.is(correctMetapost, true);
});


test.serial('Delete post', async (t) => {
  t.plan(1);

  const res = await r
    .delete(`/api/post/${postId}?access_token=${authorToken}`);

  t.is(res.status, 200);
});
