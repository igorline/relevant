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
let { alice, bob, carol, relevant, crypto, link1, link2, link3, link4, link5 } = {};

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  Eth.mintRewardTokens = jest.fn();
  Eth.getParam.mockImplementation(() => 10000);

  beforeEach(() => {
    ({ alice, bob, carol } = getUsers());
    ({ link1, link2, link3, link4, link5 } = getPosts());
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
      const voteArray = createVoteArray();

      const wait = {};
      wait.p = Promise.resolve(true);
      const votes = await voteArray.reduce(async (executed, vote) => {
        executed = await executed;
        return [...executed, await voteAndBet(vote)];
      }, Promise.resolve([]));

      const bet = sanitize(votes[0].bet);
      expect(bet).toMatchSnapshot();
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

    test('nopayout locked tokens should be returned', async () => {
      const user = await User.findOne({ _id: carol._id }, 'lockedTokens');
      expect(user.lockedTokens).toBe(0);
    });

    test('nopayout earning should be expired', async () => {
      const earning = await Earnings.findOne(
        { user: carol._id, post: link5._id },
        'status'
      );
      expect(earning.status).toBe('expired');
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

  async function voteAndBet(vote) {
    const repVote = await Invest.createVote(vote);
    const stakedTokens = (vote.user.balance + vote.user.tokenBalance) * 0.1;
    const bet = await repVote.placeBet({ ...vote, stakedTokens });
    return { repVote, bet };
  }

  function createVoteArray() {
    const relevantVote = {
      communityInstance: relevant,
      community: relevant.slug,
      communityId: relevant._id,
      amount: 1
    };

    const cryptoVote = {
      communityInstance: crypto,
      community: crypto.slug,
      communityId: crypto._id,
      amount: 1
    };

    return [
      { ...relevantVote, user: alice, post: link1 },
      { ...relevantVote, user: bob, post: link2 },
      { ...relevantVote, user: carol, post: link2 },
      { ...cryptoVote, user: bob, post: link3 },
      { ...cryptoVote, user: bob, post: link4 },
      { ...cryptoVote, user: carol, post: link5 }
    ];
  }
});

// async function placeBet({ user, post }) {
//   const stakedTokens = (user.balance + user.tokenBalance ) * 0.1;
//   await
// }
