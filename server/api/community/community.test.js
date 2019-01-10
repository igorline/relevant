import { test, request } from './../../config/ava.config';
import { cleanupData } from '../../config/test_seed';

let r;
let token;
let userToken;

const community = {
  name: 'Test',
  slug: 'test community',
  image: 'img',
  channels: [],
  topics: [],
  description: 'description',
  admins: ['test', 'slava', 'balasan']
};

const community2 = {
  name: 'Test',
  slug: 'test_community2',
  image: 'img',
  channels: [],
  topics: [],
  description: 'description',
  admins: ['test', 'slava', 'balasan']
};

const community3 = {
  name: 'Test',
  slug: 'test_community3',
  image: 'img',
  channels: [],
  topics: [],
  description: 'description',
  admins: ['test', 'slava', 'balasan']
};

test.before(async () => {
  const { app } = require('../../server.js');
  r = request(app);
  await cleanupData();
  const res = await r.post('/auth/local').send({ name: 'test', password: 'test' });
  token = res.body.token;
});


test.after(async () => {
  await cleanupData();
});


test.serial('Should not create community with bad slug', async t => {
  t.plan(1);
  const res = await r.post(`/api/community?access_token=${token}`).send(community);
  t.is(res.status, 500);
});


test.serial('Should not create community with reserved slug', async t => {
  t.plan(1);
  community.slug = 'admin';
  const res = await r.post(`/api/community?access_token=${token}`).send(community);
  t.is(res.status, 500);
});


test.serial('Should create community with correct slug', async t => {
  t.plan(1);
  community.slug = 'test_community1';
  const res = await r.post(`/api/community?access_token=${token}`).send(community);
  t.is(res.status, 200);
});


test.serial('Should get communities', async t => {
  t.plan(1);
  const res = await r.get('/api/community').send();
  t.is(res.status, 200);
});


let testBalance;
let memberships;
test.serial('Should get members', async t => {
  t.plan(2);

  let res = await r
  .get(`/api/community/${community.slug}/members?access_token=${token}`)
  .send();

  testBalance = res.body.find(m => m.user === 'test').balance;

  t.is(res.status, 200);

  res = await r.get(`/api/community/membership/test?access_token=${token}`);

  t.is(res.status, 200);

  memberships = res.body.length;
});

test.serial('Should distribute tokens correctly', async t => {
  t.plan(6);

  // -------- CREATE SECOND COMMUNITY ----------

  let res = await r.post(`/api/community?access_token=${token}`).send(community2);

  t.is(res.status, 200);

  res = await r
  .get(`/api/community/${community2.slug}/members?access_token=${token}`)
  .send();

  t.is(res.status, 200);

  let testBalanceNew = res.body.find(m => m.user === 'test').balance;

  t.is(testBalanceNew * (memberships + 1), testBalance * memberships);

  // -------- CREATE THIRD COMMUNITY ----------

  res = await r.post(`/api/community?access_token=${token}`).send(community3);

  res = await r
  .get(`/api/community/${community3.slug}/members?access_token=${token}`)
  .send();

  testBalanceNew = res.body.find(m => m.user === 'test').balance;

  t.is(testBalanceNew * (memberships + 2), testBalance * memberships);

  // -------- LEAVE FIRST COMMUNITY ----------

  let updatedCommunity = await r
  .get(`/api/community/${community.slug}?access_token=${token}`)
  .send();
  const { memberCount } = updatedCommunity.body;


  res = await r
  .put(`/api/community/${community.slug}/leave?access_token=${token}`)
  .send();

  updatedCommunity = await r
  .get(`/api/community/${community.slug}?access_token=${token}`)
  .send();
  const { memberCount: updatedMemberCount } = updatedCommunity.body;
  t.is(updatedMemberCount, memberCount - 1, 'should update member count');


  res = await r
  .get(`/api/community/${community3.slug}/members?access_token=${token}`)
  .send();

  testBalanceNew = res.body.find(m => m.user === 'test').balance;

  t.is(
    testBalanceNew * (memberships + 1),
    testBalance * memberships,
    'After leaving community balances should be distributed correctly'
  );
});

// -------- JOIN COMMUNITY ----------

test.serial('Should join community', async t => {
  t.plan(6);

  let res = await r.post('/auth/local').send({ name: 'x', password: 'x' });

  userToken = res.body.token;


  let updatedCommunity = await r.get(`/api/community/${community.slug}?access_token=${token}`).send();
  const { memberCount } = updatedCommunity.body;

  res = await r
  .put(`/api/community/${community.slug}/join?access_token=${userToken}`)
  .send();

  t.is(res.status, 200);

  t.truthy(res.body.embeddedUser);
  t.truthy(res.body.embeddedUser._id);
  t.truthy(res.body.embeddedUser.handle);
  t.truthy(res.body.embeddedUser.name);

  updatedCommunity = await r
  .get(`/api/community/${community.slug}?access_token=${token}`)
  .send();
  const { memberCount: updatedMemberCount } = updatedCommunity.body;

  t.is(updatedMemberCount, memberCount + 1, 'should update member count');
});

test.serial('Should leave community', async t => {
  t.plan(1);

  const res = await r
  .put(`/api/community/${community.slug}/leave?access_token=${userToken}`)
  .send();

  t.is(res.status, 200);
});

test.serial('Should delete community', async t => {
  t.plan(3);

  let res = await r
  .delete(`/api/community/${community.slug}?access_token=${token}`)
  .send();

  t.is(res.status, 200);

  res = await r.delete(`/api/community/${community2.slug}?access_token=${token}`).send();

  t.is(res.status, 200);

  res = await r.delete(`/api/community/${community3.slug}?access_token=${token}`).send();

  t.is(res.status, 200);
});
