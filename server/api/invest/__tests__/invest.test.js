import CommunityMember from 'server/api/community/community.member.model';
import { sanitize, toObject } from 'server/test/utils';
import Invest from 'server/api/invest/invest.model';
import { getUsers, getPosts, getCommunities } from 'server/test/seedData';
import computePageRank from 'server/utils/pagerankCompute';
import { create } from 'server/api/invest/invest.controller';
import { response } from 'jest-mock-express';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'invest';

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  let { alice, relevant, link1, req, res, communityId, communityMember } = {};

  const next = console.log; // eslint-disable-line

  beforeAll(async () => {
    ({ relevant } = getCommunities());
    ({ alice } = getUsers());
    ({ link1 } = getPosts());
    communityId = relevant._id;
    communityMember = await CommunityMember.findOne({ user: alice._id, communityId });
    await Invest.ensureIndexes();
    req = {
      user: alice,
      body: { post: { _id: link1._id }, amount: 0.5 },
      communityMember
    };
    // need to run this to give inital rank to admin
    await computePageRank({ community: relevant.slug, communityId });
  });

  beforeEach(() => {
    res = response();
    global.console = { log: jest.fn() }; // hides logs
  });

  describe('Invest', () => {
    test('should create invest', async () => {
      await create(req, res, next);
      let apiRes = toObject(res.json.mock.calls[0][0]);
      apiRes = sanitize(apiRes, 'rankChange');
      expect(apiRes).toMatchSnapshot();
    });
  });

  // describe('Invest', () => {
  //   test('should create invest', async () => {
  //     await create(req, res, next);
  //     let apiRes = toObject(res.json.mock.calls[0][0]);
  //     apiRes = sanitize(apiRes, 'rankChange');
  //     expect(apiRes).toMatchSnapshot();
  //   });
  // });
});
