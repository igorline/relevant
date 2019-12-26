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
import Treasury from 'server/api/treasury/treasury.model';

// this will define the database name where the tests are run
process.env.TEST_SUITE = 'eth-rewards';
let { alice, bob, carol, relevant, crypto, link1, link2, link3, link4, link5 } = {};

jest.mock('server/utils/ethereum');

describe('ethRewards', () => {
  Eth.mintRewardTokens = jest.fn();
  Eth.allocateRewards = jest.fn(async () => Treasury.findOne({ community: 'global' }));
  Eth.getParam.mockImplementation(() => 10000 * 1e18);

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
      await crypto.join(carol._id);
      const payouts = await ethRewards.rewards();
      Object.values(payouts.payoutData).forEach(v => {
        v.distributedRewards = v.distributedRewards.toPrecision(12);
      });
      payouts.totalDistributedRewards = payouts.totalDistributedRewards.toPrecision(12);
      expect(payouts).toMatchSnapshot();
      expect(Eth.allocateRewards).toHaveBeenCalled();
      expect(Eth.mintRewardTokens).toHaveBeenCalled();
      const treasury = await Eth.allocateRewards.mock.results[0].value;
      expect(treasury.unAllocatedRewards.toPrecision(12)).toBe(
        payouts.totalDistributedRewards
      );
      const afterAllocation = await Treasury.findOne({ community: 'global' });
      expect(afterAllocation.unAllocatedRewards).toBe(0);
    });
  });

  describe('After rewards', () => {
    test('earnings should update', async () => {
      let earnings = await Earnings.findOne({ post: link1._id, user: alice._id });
      expect(earnings.status).toBe('paidout');
      expect(earnings.community).toBe('relevant');

      earnings = sanitize(earnings);
      expect(earnings).toMatchSnapshot();

      const earningBob = await Earnings.findOne({ post: link1._id, user: bob._id });
      expect(earningBob.status).toBe('paidout');
      expect(earningBob.community).toBe('crypto');
    });

    test('cross post payout should compute correctly', async () => {
      const postDataR = await PostData.findOne({
        post: link1._id,
        communityId: relevant._id
      });
      const postDataC = await PostData.findOne({
        post: link1._id,
        communityId: crypto._id
      });
      const earningAlice = await Earnings.findOne({ post: link1._id, user: alice._id });
      const earningBob = await Earnings.findOne({ post: link1._id, user: bob._id });

      const rewardAlice =
        (postDataR.payout * earningAlice.shares * 1e-18) / postDataR.shares;
      const rewardBob = (postDataC.payout * earningBob.shares * 1e-18) / postDataC.shares;

      expect(rewardAlice).toBeCloseTo(earningAlice.earned, 10);
      expect(rewardBob).toBeCloseTo(earningBob.earned, 10);
    });

    test('invest shares and post shares should match', async () => {
      const postDataR = await PostData.findOne({
        post: link1._id,
        communityId: relevant._id
      });
      const postDataC = await PostData.findOne({
        post: link1._id,
        communityId: crypto._id
      });

      const investR = await Invest.find({ post: link1._id, communityId: relevant._id });
      const investC = await Invest.find({ post: link1._id, communityId: crypto._id });

      const sharesR = investR.reduce((a, v) => a + v.shares, 0);
      const sharesC = investC.reduce((a, v) => a + v.shares, 0);

      expect(sharesR).toBe(postDataR.shares);
      expect(sharesC).toBe(postDataC.shares);
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
      { ...cryptoVote, user: bob, post: link1 },

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
