// import { test, request } from '../../config/ava.config';

// let r;
// let token;
// let waitlistId;
// let inviteId;
// let inviteObj;
// let userId;

// test.before(async () => {
//   const { app } = require('../../server.js');
//   r = request(app);
// });

// test.serial('Add use to waitlist', async t => {
//   t.plan(2);

//   const res = await r
//   .post('/api/list')
//   .send({ name: 'testSignup', password: 'testSignup', email: 'testSignup@test.com' });

//   t.is(res.status, 200);
//   waitlistId = res.body._id;
//   t.is(res.body.status, 'waitlist');
// });

// test.serial('Send invite to user', async t => {
//   t.plan(4);

//   const login = await r.post('/auth/local').send({ name: 'test', password: 'test' });

//   token = login.body.token;
//   t.is(login.status, 200);

//   const invite = await r
//   .put('/api/list/')
//   .set('Authorization', 'bearer ' + token)
//   .send([{ name: 'testSignup', email: 'testSignup@test.com' }]);

//   t.is(invite.status, 200, 'request should succeed');
//   t.truthy(invite.body.length, 'body should be array');
//   inviteId = invite.body[0]._id;
//   inviteObj = invite.body[0];
//   t.is(invite.body[0].status, 'email sent', 'status should be invited');
// });

// test.serial('Should fail with incorrect username', async t => {
//   t.plan(2);

//   const signup = await r.post('/api/user').send({
//     invite: inviteObj,
//     user: {
//       name: 'test signup',
//       email: 'testSignup@email.com',
//       password: 'testSignup'
//     }
//   });

//   t.is(signup.status, 500, 'should fail');

//   const signup2 = await r.post('/api/user').send({
//     invite: inviteObj,
//     user: {
//       name: 'test.signup',
//       email: 'testSignup@email.com',
//       password: 'testSignup'
//     }
//   });

//   t.is(signup2.status, 500, 'should fail');
// });

// // TODO signup
// test.serial('Signup with invite', async t => {
//   t.plan(2);

//   const signup = await r.post('/api/user').send({
//     invite: inviteObj,
//     user: {
//       name: 'testSignup',
//       email: 'testSignup',
//       password: 'testSignup'
//     }
//   });

//   t.is(signup.status, 200, 'should be able to sign up');

//   userId = signup.body.user._id;
//   t.truthy(userId, 'should have user id');
// });

// test.serial('Remove Invite', async t => {
//   t.plan(1);

//   const remove = await r
//   .delete('/api/list/' + waitlistId)
//   .set('Authorization', 'bearer ' + token)
//   .send();

//   t.is(remove.status, 200, 'should remove invite');
// });

// test.serial('Remove Invite', async t => {
//   t.plan(1);

//   const remove = await r
//   .delete('/api/invites/' + inviteId)
//   .set('Authorization', 'bearer ' + token)
//   .send();

//   t.is(remove.status, 200);
// });

// test.serial('Remove User', async t => {
//   t.plan(1);

//   const remove = await r
//   .delete('/api/user/' + userId)
//   .set('Authorization', 'bearer ' + token)
//   .send();

//   t.is(remove.status, 204);
// });
