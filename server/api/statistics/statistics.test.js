import test from 'ava';
var request = require('supertest-as-promised');

//need to swithc cdw to the main project directory
process.env.NODE_ENV = 'test';
process.chdir(__dirname + '/../../../');

var token;
var r;

test.beforeEach(t => {
  t.context = require('../../server.js');
});

test.before( async t => {
  var app = require('../../server.js').app;
  r = request(app);
  // var clean = await cleanupData();
  // await setupData();
});

test.serial('Auth', async t => {
  t.plan(2);

  const res = await r
      .post('/auth/local')
      .send({ email: 'test@test.com', password: 'test'})

  token = res.body.token
  t.is(res.status, 200)
  t.truthy(token, "Token should not be null")
});


test.serial('Get stats', async t => {
  t.plan(2);

  var endTime = new Date();
  var startTime = new Date(endTime - 1000 * 60 * 60 * 1);

  const res = await r
      .get('/api/statistics'
        + '?startTime=' + startTime
        + ';&endTime=' + endTime
        + ';&access_token='+token)
      .send()

  var isCorrectType = res.body instanceof Array;
  console.log("STATS RESPONCE ", res.body);
  t.is(res.status, 200)
  t.is(isCorrectType, true)

})

test.serial('Get change %', async t => {
  t.plan(2);

  var endTime = new Date();
  var startTime = new Date(endTime - 1000 * 60 * 60 * 1);

  const res = await r
      .get('/api/statistics/change'
        + '?startTime=' + startTime
        + ';&endTime=' + endTime
        + ';&access_token='+token)
      .send()

  console.log("CHANGE RESPONCE ", res.body);

  var isCorrectType = res.body instanceof Object;
  console.log("CHANGE RESPONCE ", res.body);
  t.is(res.status, 200)
  t.is(isCorrectType, true)

})



