import CommunityMember from 'server/api/community/community.member.model';
// import Community from 'server/api/community/community.model';
import { community } from 'app/mockdata';
import { getUsers } from 'server/test/seedData';
import { create, join, leave } from 'server/api/community/community.controller';
import { response } from 'jest-mock-express';
import { sanitize } from 'server/test/utils';

const { brandNew } = community;
process.env.TEST_SUITE = 'communities';

describe('Communities', () => {
  let res;
  let req;
  let bob;
  let carol;
  const next = console.log; // eslint-disable-line

  beforeEach(() => {
    res = response();
    ({ bob, carol } = getUsers());
    req = {
      user: bob,
      body: brandNew
    };
  });

  describe('community', () => {
    test('create', async () => {
      await create(req, res, next);
      let apiRes = res.json.mock.calls[0][0].toObject();

      apiRes = sanitize(apiRes, 'lastRewardFundUpdate');
      expect(apiRes.image).toBe(brandNew.image);
      expect(apiRes).toMatchSnapshot();
    });

    test('join', async () => {
      req = {
        user: carol,
        params: brandNew
      };
      await join(req, res, next);
      let apiRes = res.json.mock.calls[0][0].toObject();

      apiRes = sanitize(apiRes);
      expect(apiRes).toMatchSnapshot();
    });

    test('leave', async () => {
      req = {
        user: carol,
        params: brandNew
      };
      await leave(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      const deleted = await CommunityMember.findOne({
        user: carol._id,
        communityId: brandNew._id
      });
      expect(deleted).toBe(null);
    });
  });
});
