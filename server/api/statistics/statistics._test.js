// import { test, request } from '../../config/ava.config';

// let token;
// let r;

// test.beforeEach(t => {
//   t.context = require('../../server.js');
// });

// test.before(async () => {
//   const { app } = require('../../server.js');
//   r = request(app);
// });

// test.serial('Auth', async t => {
//   t.plan(2);

//   const res = await r.post('/auth/local').send({ name: 'test', password: 'test' });

//   token = res.body.token;
//   t.is(res.status, 200);
//   t.truthy(token, 'Token should not be null');
// });

// test.serial('Get stats', async t => {
//   t.plan(2);

//   const endTime = new Date();
//   const startTime = new Date(endTime - 1000 * 60 * 60 * 1);

//   const res = await r
//   .get(
//     '/api/statistics' +
//         '?startTime=' +
//         startTime +
//         ';&endTime=' +
//         endTime +
//         ';&access_token=' +
//         token
//   )
//   .send();

//   const isCorrectType = res.body instanceof Object;
//   t.is(res.status, 200);
//   t.is(isCorrectType, true);
// });
