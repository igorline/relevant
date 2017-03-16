import test from 'ava';

import { setupData, cleanupData, dummyUsers } from '../../config/test_seed';

let request = require('supertest-as-promised');

process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');

let r;
let token;
let postId;
let savedPost;

let post = {
  link: 'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
  body: 'Hotties',
  title: 'Test post title',
  description: 'Test post description',
  image: 'https://relevant-images.s3.amazonaws.com/lxpepcs4r_lias',
  investments: [],
  tags: ['tag1', 'tag2'],
};

// cleanupData();

test.before(async () => {
  let app = require('../../server.js').app;
  r = request(app);
  let clean = await cleanupData();
  await setupData();
});

test.after(async () => {
  await cleanupData();
});

test.serial('Auth', async (t) => {
  t.plan(2);

  const res = await r
  .post('/auth/local')
  .send({ email: 'test@test.com', password: 'test' });

  token = res.body.token;
  t.is(res.status, 200);
  t.truthy(token, 'Token should not be null');
});

test.serial('Create first post', async (t) => {
  t.plan(6);

  const res = await r
  .post('/api/post' + '?access_token=' + token)
  .send(post);

  let isObject = res.body instanceof Object;
  postId = res.body._id;
  savedPost = res.body;
  // console.log('CREATED POST ', res.body);
  t.is(res.status, 200);
  t.is(isObject, true);
  t.truthy(res.body.tagsText.length);
  t.is(res.body.relevance, 0, 'Relevance should be 0');
  t.is(res.body.value, 0, 'Value should be 0');
  t.truthy(postId, true);
});


test.serial('Invest Auth', async (t) => {
  t.plan(2);

  const res = await r
  .post('/auth/local')
  .send({ email: 'admin@admin.com', password: 'admin' });

  token = res.body.token;
  t.is(res.status, 200);
  t.truthy(token, 'Token should not be null');
});


test.serial('Check feed objects', async (t) => {
  t.plan(3);

  const res = await r
  .get('/api/feed/post/' + postId + '?access_token=' + token);

  let user = dummyUsers[2];
  let find = res.body.find((u) => {
    console.log('FEED USER ', u.userId);
    console.log('THIS USER ', user._id);
    return u.userId.toString() === user._id.toString();
  });
  t.truthy(find);

  let length = res.body.length;
  t.is(res.status, 200);
  t.truthy(length);
});

test.serial('Delete post', async (t) => {
  t.plan(1);

  const res = await r
  .delete('/api/post/' + postId + '?access_token=' + token);

  t.is(res.status, 200);
});


