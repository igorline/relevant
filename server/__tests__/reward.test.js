import ethRewards from 'server/utils/ethRewards';
import { sanitize } from 'server/test/utils';
import Invest from 'server/api/invest/invest.model';
import User from 'server/api/user/user.model';
import Post from 'server/api/post/post.model';
import PostData from 'server/api/post/postData.model';
import Earnings from 'server/api/earnings/earnings.model';
import Notification from 'server/api/notification/notification.model';
import { getUsers, getPosts, getCommunities } from 'server/test/seedData';
import * as Eth from 'server/utils/ethereum';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'eth-rewards';
let { alice, bob, carol, relevant, crypto, link1, link2, link3, link4 } = {};

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  Eth.mintRewardTokens = jest.fn();
  Eth.getParam.mockImplementation(() => 10000);

  beforeEach(() => {
    ({ alice, bob, carol } = getUsers());
    ({ link1, link2, link3, link4 } = getPosts());
    ({ relevant, crypto } = getCommunities());
    global.console = { log: jest.fn() }; // hides logs
  });

  describe('No Rewards', () => {
    test('should not compute rewards', async () => {
      const payouts = await ethRewards.rewards();
      expect(payouts).toBe(false);
    });
  });

  describe('Votes', () => {
    test('should be created', async () => {
      const relevantVote = {
        relevanceToAdd: 10,
        community: relevant.slug,
        communityId: relevant._id,
        amount: 1
      };

      const cryptoVote = {
        relevanceToAdd: 10,
        community: crypto.slug,
        communityId: crypto._id,
        amount: 1
      };

      let invest = await Invest.createVote({
        ...relevantVote,
        user: alice,
        post: link1
      });
      await Invest.createVote({ ...relevantVote, user: bob, post: link2 });
      await Invest.createVote({ ...relevantVote, user: carol, post: link2 });
      await Invest.createVote({ ...cryptoVote, user: bob, post: link3 });
      await Invest.createVote({ ...cryptoVote, user: bob, post: link4 });

      invest = sanitize(invest);
      expect(invest).toMatchSnapshot();
    });
  });

  describe('Rewards', () => {
    test('should compute correctly', async () => {
      const payouts = await ethRewards.rewards();
      expect(payouts).toMatchSnapshot();
    });
  });

  describe('After rewards', () => {
    test('earnings should update', async () => {
      let earnings = await Earnings.findOne({ post: link1._id, user: alice._id });
      expect(earnings.status).toBe('paidout');
      earnings = sanitize(earnings);
      expect(earnings).toMatchSnapshot();
    });

    test('locked tokens should be returned', async () => {
      const user = await User.findOne({ _id: alice._id }, 'lockedTokens');
      expect(user.lockedTokens).toBe(0);
    });

    test('mature posts should be paidout', async () => {
      const post = await Post.findOne({ _id: link1._id }).populate('data');
      expect(post.data.paidOut).toBe(true);
    });

    test('pending posts should not be paid out', async () => {
      const post = await Post.findOne({ _id: link4._id }).populate('data');
      expect(post.data.paidOut).toBe(false);
    });

    test('pending posts should update', async () => {
      let pending = await Earnings.findOne({ post: link4._id, user: bob._id });
      expect(pending.estimatedPostPayout > 0).toBeTruthy();
      pending = sanitize(pending);
      expect(pending).toMatchSnapshot();
    });

    test('should create notification', async () => {
      let notification = await Notification.findOne({
        post: link1._id,
        forUser: alice._id
      });
      notification = sanitize(notification);
      expect(notification).toMatchSnapshot();
    });

    test('should reset community staked tokens', async () => {
      const postStake = await PostData.findOne({ post: link4._id });
      const updatedBalances = await Earnings.stakedTokens();
      const totalBalance = updatedBalances.reduce((a, c) => c.stakedTokens + a, 0);
      expect(totalBalance).toBe(postStake.balance);
    });
    // test('logs should match', async () => {
    //   const logs = console.log.mock.calls
    //   .map(log => log.map(l => JSON.stringify(l)).join(' ').trim())
    //   .join('\n').replace(/"/g, '');
    //   expect(logs).toMatchSnapshot();
    // });
  });
});
