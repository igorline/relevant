import User from 'server/api/user/user.model';
import { response } from 'jest-mock-express';
import { create, confirm } from 'server/api/user/user.controller';
import { user, twitter } from 'app/mockdata';
import { sanitize } from 'server/test/utils';
import { handleTwitterAuth } from 'server/auth/twitter/passport';
import { TWITTER_REWARD, EMAIL_REWARD } from 'server/config/globalConstants';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'user';

describe('User', () => {
  let res;
  let req;
  let aliceId;
  let next; // eslint-disable-line
  // const next = jest.fn(console.log); // eslint-disable-line
  global.console.log = jest.fn(); // hides logs

  beforeEach(() => {
    res = response();
    next = jest.fn();
    // req = { body: { user: user.user1 } };
  });

  describe('api/user/create should fail', () => {
    test('no email', async () => {
      req = { body: { user: { ...user.user1, email: null } } };
      await create(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    // TODO
    // test('bad email', async () => {
    //   req = { body: { user: { ...user.user1, email: 'yo' } } };
    //   await create(req, res, next);
    //   expect(next).toHaveBeenCalled();
    // });

    test('bad handle', async () => {
      req = { body: { user: { ...user.user1, name: 'admin' } } };
      await create(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('api/user/create', () => {
    test('create user', async () => {
      req = { body: { user: user.user1 } };
      await create(req, res, next);
      const apiRes = res.json.mock.calls[0][0];
      expect(apiRes.user.confirmCode).toBeTruthy();
      expect(apiRes.user.password).not.toBeDefined();
      expect(apiRes.user.hashedPassword).not.toBeDefined();
      aliceId = apiRes.user._id;
      const newUser = sanitize(apiRes.user, 'confirmCode lastVote');
      expect(newUser).toMatchSnapshot();
    });
  });

  describe('api/user/confirm', () => {
    test('should confirm email and get tokens', async () => {
      const dbUser = await User.findOne({ _id: aliceId }, 'confirmCode handle');
      req = { body: { user: dbUser.handle, code: dbUser.confirmCode } };
      await confirm(req, res, next);
      const apiRes = res.json.mock.calls[0][0];
      expect(apiRes.confirmed).toBe(true);
      expect(apiRes.balance).toBe(EMAIL_REWARD);
      expect(apiRes.airdropTokens).toBe(EMAIL_REWARD);
    });
  });

  describe('new signup with twitter', () => {
    test('should sign up with twitter and get tokens', async () => {
      req = {};
      const twitterAuth = 'xxxx';
      await handleTwitterAuth({ req, twitterAuth, profile: twitter.profile });
      const twitterUser = await User.findOne({ handle: twitter.profile.username });
      expect(twitterUser.balance).toBe(TWITTER_REWARD + EMAIL_REWARD);
    });
  });

  describe('missing email', () => {
    test('should handle missing email', async () => {
      req = {};
      const twitterAuth = 'xxxx';
      await handleTwitterAuth({ req, twitterAuth, profile: twitter.profileNoEmail });
      const twitterUser = await User.findOne(
        { handle: twitter.profileNoEmail.username },
        '+email +twitter'
      );
      expect(twitterUser.email).toBe(undefined);
      expect(twitterUser.confirmed).toBe(false);
    });
  });
});
