import User from 'server/api/user/user.model';

import { user } from 'app/mockdata';

const { user1 } = user;

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'test-test';

describe('USER', () => {
  // beforeEach(() => {
  //   System.ensureIndexes({ loc: '2d' });
  // });
  describe('CREATE', () => {
    test('can create a user', async () => {
      await new User(user1).save();
      const newUser = await User.findOne({ _id: user1._id });
      const savedUser = { ...user1 };
      delete savedUser.password;
      savedUser.relevance = null;

      expect(JSON.parse(JSON.stringify(newUser))).toMatchObject(savedUser);
    });
  });
});
