import test from 'ava';
let request = require('supertest');

// need to swithc cdw to the main project directory
// console.log("NODE DIR", __dirname)
process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');
// console.log(process.cwd())


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

test('Create post without being logged in', async t => {
  t.plan(1);

  const res = await request(t.context.app)
      .post('/api/post');

  t.is(res.status, 500, 'Should not be able to creat new post if not logged in');
});


