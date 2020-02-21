import CommunityMember from 'server/api/community/community.member.model';
// import Community from 'server/api/community/community.model';
import { community } from 'app/mockdata';
import { getUsers } from 'server/test/seedData';
import { create, join, leave, update } from 'server/api/community/community.controller';
import { response } from 'jest-mock-express';
import { sanitize } from 'server/test/utils';

const { brandNew } = community;
process.env.TEST_SUITE = 'communities';

describe('Communities', () => {
  let res;
  let req;
  let bob;
  let carol;
  let newCommunityId;
  const next = jest.fn(console.log); // eslint-disable-line

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

      newCommunityId = apiRes._id;
      apiRes = sanitize(apiRes, ['lastRewardFundUpdate', 'communityId']);
      const bobIsAdmin = apiRes.superAdmins.find(a => a.user.equals(bob._id));
      expect(bobIsAdmin).toBeDefined();
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

      apiRes = sanitize(apiRes, 'communityId');
      expect(apiRes).toMatchSnapshot();
    });

    test('should not allow update', async () => {
      req = {
        user: carol,
        body: { ...brandNew, superAdmins: ['carol'] }
      };
      const errFn = jest.fn();
      await update(req, res, errFn);
      expect(errFn).toHaveBeenCalled();
    });

    test('should update', async () => {
      const bobMember = await CommunityMember.findOne({
        communityId: newCommunityId,
        user: bob._id
      });
      req = {
        user: bob,
        body: { ...brandNew, superAdmins: ['carol'], _id: newCommunityId },
        communityMember: bobMember
      };
      await update(req, res, next);
      let apiRes = res.json.mock.calls[0][0].toObject();
      apiRes = sanitize(apiRes, ['communityId', 'lastRewardFundUpdate']);

      const carolIsAdmin = apiRes.superAdmins.find(a => a.user.equals(carol._id));
      expect(carolIsAdmin).toBeDefined();
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
