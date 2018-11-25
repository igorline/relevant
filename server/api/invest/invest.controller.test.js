import test from 'ava';
let request = require('supertest');

process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');

test.beforeEach(t => {
  t.context = require('../../server.js');
});


test('post:Index', async t => {
  t.plan(2);

  const res = await request(t.context.app)
  .get('/api/post');

  let array = res.body instanceof Object;
  t.is(res.status, 200, 'Return correct status');
  t.is(array, true, 'Return array/object');
});

