import Invite from 'server/api/invites/invite.model';
import CommunityMember from 'server/api/community/community.member.model';
import { response } from 'jest-mock-express';
import { create } from 'server/api/invites/invite.controller';
import { create as createUser } from 'server/api/user/user.controller';
import { referral } from 'app/mockdata/invite';
import { sanitize, toObject } from 'server/test/utils';
import { getUsers, getCommunities } from 'server/test/seedData';
import { totalAllowedInvites } from 'server/config/globalConstants';
import { user2 } from 'app/mockdata/user';
import computePageRank from 'server/utils/pagerankCompute';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'invites';

describe('CreatePost', () => {
  let { alice, relevant, communityMember, res, req, communityId, invite } = {};
  const next = console.log; // eslint-disable-line

  beforeAll(async () => {
    ({ relevant } = getCommunities());
    ({ alice } = getUsers());
    communityId = relevant._id;
    communityMember = await CommunityMember.findOne({ user: alice._id, communityId });
    await Invite.ensureIndexes();
    req = {
      user: alice,
      body: referral,
      communityMember
    };
    // need to run this to give inital rank to admin
    await computePageRank({ community: relevant.slug, communityId });
  });

  beforeEach(() => {
    res = response();
  });

  describe('api/invite/create', () => {
    test('create invite', async () => {
      await create(req, res, next);
      let apiRes = toObject(res.json.mock.calls[0][0]);
      invite = apiRes[0];
      expect(invite.code).toBeDefined();
      apiRes = sanitize(apiRes, 'code');
      expect(apiRes).toMatchSnapshot();
    });
  });

  describe('after invite was created', () => {
    test('invite count should update', async () => {
      const aliceMember = await CommunityMember.findOne({ user: alice._id, communityId });
      const totalInvites = totalAllowedInvites({ alice, communityId });
      expect(aliceMember.invites).toBe(totalInvites - 1);
    });

    test('should create new user with referral', async () => {
      req = { body: { user: user2, invite: invite.code } };
      await createUser(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      apiRes.user.relevance.pagerank =
        Math.round(apiRes.user.relevance.pagerank * 100) / 100;
      apiRes.user.relevance.pagerankRaw =
        Math.round(apiRes.user.relevance.pagerankRaw * 100000) / 100000;
      const newUser = sanitize(apiRes.user, 'confirmCode lastVote user');
      expect(newUser).toMatchSnapshot();
    });
  });
});
