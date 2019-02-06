/**
 * @jest-environment node
 */
import request from 'supertest';
import ethRewards from './ethRewards';
import { setupData, cleanupData, initEth } from '../config/test_seed';

let r;
let token;
let authorToken;
let postId;
let postId2;
let parentPost;
const comms = ['crypto', 'relevant'];

function getPostObj() {
  const now = new Date();
  return {
    url:
      'https://www.washingtonpost.com/news/checkpoint/wp/2016/05/12/three-deaths-linked-to-recent-navy-seal-training-classes/?hpid=hp_hp-top-table-main_navyseals-118pm%3Ahomepage%2Fstory',
    body: 'Hotties',
    title: 'Test post title',
    description: 'Test post description',
    image:
      'https://static.boredpanda.com/blog/wp-content/uploads/2016/08/cute-kittens-30-57b30ad41bc90__605.jpg',
    tags: ['tag1', 'tag2'],
    payoutTime: now,
    community: 'relevant'
  };
}

function getUpvoteObj(id) {
  return {
    post: { _id: id },
    amount: 1
  };
}

const { app, db } = require('../server.js');

// const flushPromises = () => {
//   return new Promise(resolve => setImmediate(resolve));
// };

beforeAll(async () => {
  await db;
  r = request(app);

  // just in case
  await cleanupData();
  await setupData(comms);
  await initEth();
});

afterAll(async () => {
  await cleanupData();
});

describe('Rewards Test', () => {
  test('Payout Create Post', async () => {
    const res = await r.post('/auth/local').send({ name: 'dummy1', password: 'test' });

    authorToken = res.body.token;

    const newPost = await r
    .post(`/api/post?access_token=${authorToken}&community=${comms[0]}`)
    .send(getPostObj());

    postId = newPost.body._id;

    expect(newPost.body.parentPost).toBeTruthy();
    parentPost = newPost.body.parentPost._id;
    expect(parentPost).toBeTruthy();

    const newPost2 = await r
    .post(`/api/post?access_token=${authorToken}&community=${comms[1]}`)
    .send(getPostObj());

    expect(res.status).toBe(200);
    expect(authorToken).toBeTruthy();

    postId2 = newPost2.body._id;

    expect(newPost2.body.parentPost).toBeTruthy();
    const parentPost2 = newPost2.body.parentPost._id;

    expect(parentPost2).toBe(parentPost);
    expect(newPost.status).toBe(200);
  });

  test('Upvote 1', async () => {
    expect.assertions(2);

    const login = await r.post('/auth/local').send({ name: 'dummy2', password: 'test' });

    ({ token } = login.body);

    expect(login.status).toBe(200);

    const upvote = await r
    .post(`/api/invest?access_token=${token}&community=${comms[0]}`)
    .send(getUpvoteObj(parentPost));

    expect(upvote.status).toBe(200);
  });

  test('Upvote 2', async () => {
    expect.assertions(3);

    const login = await r.post('/auth/local').send({ name: 'dummy3', password: 'test' });

    ({ token } = login.body);

    expect(login.status).toBe(200);

    const upvote = await r
    .post(`/api/invest?access_token=${token}&community=${comms[0]}`)
    .send(getUpvoteObj(parentPost));

    const upvote2 = await r
    .post(`/api/invest?access_token=${token}&community=${comms[1]}`)
    .send(getUpvoteObj(parentPost));

    expect(upvote.status).toBe(200);
    expect(upvote2.status).toBe(200);
  });

  test('Payout Upvote', async () => {
    expect.assertions(1);
    try {
      const payouts = await ethRewards.rewards();
      expect(typeof payouts).toBe('object');
    } catch (err) {
      throw err;
    }
  });

  test('Delete post', async () => {
    expect.assertions(2);
    const res = await r.delete(
      `/api/post/${postId}?access_token=${authorToken}&community=${comms[0]}`
    );

    const res2 = await r.delete(
      `/api/post/${postId2}?access_token=${authorToken}&community=${comms[1]}`
    );

    expect(res2.status).toBe(200);
    expect(res.status).toBe(200);
  });
});
