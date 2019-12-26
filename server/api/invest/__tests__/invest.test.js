import CommunityMember from 'server/api/community/community.member.model';
import { sanitize, toObject } from 'server/test/utils';
import Invest from 'server/api/invest/invest.model';
import Post from 'server/api/post/post.model';
import { getUsers, getPosts, getCommunities } from 'server/test/seedData';
import computePageRank from 'server/pagerank/pagerankCompute';
import { create, bet } from 'server/api/invest/invest.controller';
import { response } from 'jest-mock-express';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'invest';

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  let { alice, bob, relevant, link1, req, res, communityId, communityMember } = {};

  const next = jest.fn(console.log); // eslint-disable-line
  let voteId;

  beforeAll(async () => {
    ({ relevant } = getCommunities());
    ({ alice, bob } = getUsers());
    ({ link1 } = getPosts());
    communityId = relevant._id;
    communityMember = await CommunityMember.findOne({ user: alice._id, communityId });

    const stakedTokens = alice.balance * 0.1;

    req = {
      user: alice,
      body: { post: { _id: link1._id }, amount: 0.5, stakedTokens, postId: link1._id },
      communityMember
    };
    // need to run this to give inital rank to admin
    await computePageRank({ community: relevant.slug, communityId });
  });

  beforeEach(() => {
    res = response();
    global.console.log = jest.fn(); // hides logs
  });

  describe('Invest', () => {
    test('should create invest without bet', async () => {
      await create(req, res, next);
      let apiRes = toObject(res.json.mock.calls[0][0]);
      voteId = apiRes.investment._id;
      apiRes = sanitize(apiRes, 'rankChange');
      expect(apiRes).toMatchSnapshot();
      expect(apiRes.investment.shares).toBe(0);
      expect(apiRes.investment.stakedTokens).toBe(0);
    });

    test('rank should update', async () => {
      const post = await Post.findOne({ _id: link1._id }).populate({
        path: 'data',
        communityId
      });
      expect(post.data.rank).toBeGreaterThan(0);
    });
  });

  describe('Bet', () => {
    test('should bet on post', async () => {
      await bet(req, res, next);
      const { stakedTokens } = req.body;
      let apiRes = toObject(res.json.mock.calls[0][0]);
      apiRes = sanitize(apiRes, 'rankChange');
      expect(apiRes).toMatchSnapshot();

      expect(apiRes.shares).toBeGreaterThan(0);
      expect(apiRes.stakedTokens).toBe(stakedTokens);
    });
  });

  // Todo test all cases of non-invest

  describe('Undo', () => {
    test('should not be able to undo vote after bet', async () => {
      await create(req, res, next);
      expect(next).toBeCalled();
    });
  });

  describe('AutoBet', () => {
    test('should create invest with bet', async () => {
      bob.notificationSettings.bet.manual = false;
      await bob.save();
      req.user = bob;
      await create(req, res, next);
      const apiRes = toObject(res.json.mock.calls[0][0]);
      voteId = apiRes.investment._id;
      expect(apiRes.investment.shares).not.toBe(0);
      expect(apiRes.investment.stakedTokens).not.toBe(0);
    });

    test('should undo auto-bet', async () => {
      await create(req, res, next);
      let apiRes = toObject(res.json.mock.calls[0][0]);
      apiRes = sanitize(apiRes, 'rankChange');
      expect(apiRes).toMatchSnapshot();

      const removedVote = await Invest.findOne({ _id: voteId });
      expect(removedVote).toBe(null);
    });
  });
});
