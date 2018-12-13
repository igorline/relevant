import test from 'ava';
import ethRewards from './ethRewards';
import { setupData, cleanupData, dummyUsers, initEth } from '../config/test_seed';

const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';
process.chdir(__dirname + '/../../');

let r;
let token;
let authorToken;
let postId;
let postId2;
const comms = ['crypto', 'relevant'];

function getPostObj() {
  const now = new Date();
  return {
    link: 'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
    body: 'Hotties',
    title: 'Test post title',
    description: 'Test post description',
    image: 'https://static.boredpanda.com/blog/wp-content/uploads/2016/08/cute-kittens-30-57b30ad41bc90__605.jpg',
    tags: ['tag1', 'tag2'],
    payoutTime: now,
    community: 'relevant',
  };
}

function getUpvoteObj(id) {
  return {
    post: { _id: id },
    amount: 1
  };
}

test.before(async () => {
  const app = require('../server.js').app;
  r = request(app);

  require('dotenv').config({ silent: true });
  // just in case
  await cleanupData();
  await setupData(comms);
  await initEth();
});

test.after(async () => {
  await cleanupData();
});

test.serial('Payout Create Post', async (t) => {
  t.plan(3);

  const res = await r
    .post('/auth/local')
    .send({ name: 'dummy1', password: 'test' });

  authorToken = res.body.token;

  const newPost = await r
    .post(`/api/post?access_token=${authorToken}&community=${comms[0]}`)
    .send(getPostObj());

  postId = newPost.body._id;

  const newPost2 = await r
    .post(`/api/post?access_token=${authorToken}&community=${comms[1]}`)
    .send(getPostObj());

  t.is(res.status, 200);
  t.truthy(authorToken, 'Token should not be null');

  postId2 = newPost2.body._id;

  t.is(newPost.status, 200);
});


test.serial('Upvote 1', async (t) => {
  t.plan(2);

  const login = await r
    .post('/auth/local')
    .send({ name: 'dummy2', password: 'test' });

  token = login.body.token;

  t.is(login.status, 200);

  const upvote = await r
    .post(`/api/invest?access_token=${token}&community=${comms[0]}`)
    .send(getUpvoteObj(postId));

  t.is(upvote.status, 200);
});

test.serial('Upvote 2', async (t) => {
  t.plan(3);

  const login = await r
    .post('/auth/local')
    .send({ name: 'dummy3', password: 'test' });

  token = login.body.token;

  t.is(login.status, 200);

  const upvote = await r
    .post(`/api/invest?access_token=${token}&community=${comms[0]}`)
    .send(getUpvoteObj(postId));

  const upvote2 = await r
    .post(`/api/invest?access_token=${token}&community=${comms[1]}`)
    .send(getUpvoteObj(postId2));

  t.is(upvote.status, 200);
  t.is(upvote2.status, 200);
});

test.serial('Check feed objects', async (t) => {
  t.plan(3);

  const res = await r
    .get('/api/feed/post/' + postId + '?access_token=' + token);

  const user = dummyUsers[1];
  const find = res.body.find((u) => {
    console.log('FEED USER ', u.userId);
    console.log('THIS USER ', user._id);
    return u.userId.toString() === user._id.toString();
  });
  t.truthy(find);

  const length = res.body.length;
  t.is(res.status, 200);
  t.truthy(length);
});


test.serial('Payout Upvote', async (t) => {
  t.plan(1);
  try {
    const payouts = await ethRewards.rewards();
    t.is(typeof payouts, 'object', 'should compute payouts');
  } catch (err) {
    console.log(err);
  }
});

// TODO add reward notification test (that format is correct)

test.serial('Delete post', async (t) => {
  t.plan(2);

  const res = await r
    .delete(`/api/post/${postId}?access_token=${authorToken}&community=${comms[0]}`);

  const res2 = await r
    .delete(`/api/post/${postId2}?access_token=${authorToken}&community=${comms[1]}`);

  t.is(res2.status, 200);
  t.is(res.status, 200);
});

