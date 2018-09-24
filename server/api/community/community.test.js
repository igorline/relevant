import test from 'ava';

let request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';

process.chdir(__dirname + '/../../../');

let r;
let token;

let community = {
  name: 'Test',
  slug: 'test community',
  image: 'img',
  channels: [],
  topics: [],
  description: 'description',
  admins: ['test', 'slava', 'balasan']
};

test.before(async () => {
  let app = require('../../server.js').app;
  r = request(app);

  const res = await r
  .post('/auth/local')
  .send({ name: 'test', password: 'test' });

  token = res.body.token;
});

test.serial('Should not create community with bad slug', async (t) => {
  t.plan(1);

  const res = await r
  .post(`/api/community?access_token=${token}`)
  .send(community);

  t.is(res.status, 500);
});

test.serial('Should not create community with reserved slug', async (t) => {
  t.plan(1);

  community.slug = 'admin';

  const res = await r
  .post(`/api/community?access_token=${token}`)
  .send(community);

  t.is(res.status, 500);
});

test.serial('Should create community with correct slug', async (t) => {
  t.plan(1);

  community.slug = 'test';

  const res = await r
  .post(`/api/community?access_token=${token}`)
  .send(community);

  t.is(res.status, 200);
});

test.serial('Should get communities', async (t) => {
  t.plan(1);

  const res = await r
  .get(`/api/community`)
  .send();

  console.log(res.body);
  t.is(res.status, 200);
});

test.serial('Should delete community', async (t) => {
  t.plan(1);

  const res = await r
  .delete(`/api/community/${community.slug}?access_token=${token}`)
  .send();

  t.is(res.status, 200);
});

