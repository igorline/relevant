import User from 'server/api/user/user.model';
import { response } from 'jest-mock-express';
import { create } from 'server/api/user/user.controller';
import { user } from 'app/mockdata';
import { sanitize } from 'server/test/utils';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'user';

describe('CreatePost', () => {
  let res;
  let req;
  const next = console.log; // eslint-disable-line

  beforeAll(async () => {
    await User.ensureIndexes();
  });

  beforeEach(() => {
    res = response();
    req = { body: { user: user.user1 } };
  });

  describe('api/user/create', () => {
    test('create user', async () => {
      await create(req, res, next);
      const apiRes = res.json.mock.calls[0][0];
      expect(apiRes.user.confirmCode).toBeTruthy();
      expect(apiRes.user.password).not.toBeDefined();
      expect(apiRes.user.hashedPassword).not.toBeDefined();
      const newUser = sanitize(apiRes.user, 'confirmCode lastVote');
      expect(newUser).toMatchSnapshot();
    });
  });
});
