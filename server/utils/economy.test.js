import test from 'ava';
import economy from './economy';

import { setupData, cleanupData, dummyUsers } from '../config/test_seed';

let request = require('supertest');

process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../');

let r;
let token;
let authorToken;
let postId;
let postId2;
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
  let app = require('../server.js').app;
  r = request(app);
  // just in case
  await cleanupData();
  await setupData();
});

test.after(async () => {
  // await cleanupData();
});





test.serial('Payout Create Post', async (t) => {
  t.plan(3);

  const res = await r
  .post('/auth/local')
  .send({ name: 'dummy1', password: 'test' });

  authorToken = res.body.token;

  const newPost = await r
  .post(`/api/post?access_token=${authorToken}`)
  .send(getPostObj());

  postId = newPost.body._id;
  savedPost = newPost.body;


  const newPost2 = await r
  .post(`/api/post?access_token=${authorToken}`)
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
  .post(`/api/invest?access_token=${token}`)
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
  .post(`/api/invest?access_token=${token}`)
  .send(getUpvoteObj(postId));

  const upvote2 = await r
  .post(`/api/invest?access_token=${token}`)
  .send(getUpvoteObj(postId2));

  t.is(upvote.status, 200);
  t.is(upvote2.status, 200);

});

test.serial('Check feed objects', async (t) => {
  t.plan(3);

  const res = await r
  .get('/api/feed/post/' + postId + '?access_token=' + token);

  let user = dummyUsers[1];
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


test.serial('Payout Upvote', async (t) => {
  t.plan(0);

  // const res = await r
  // .post('/auth/local')
  // .send({ name: 'dummy1', password: 'test' });
  try {
    await economy.rewards();
  } catch (err) {
    console.log(err);
  }


});

// test.serial('Delete post', async (t) => {
//   t.plan(1);

//   const res = await r
//   .delete(`/api/post/${postId}?access_token=${authorToken}`);

//   t.is(res.status, 200);
// });

