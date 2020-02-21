import User from 'server/api/user/user.model';
import { cashOut } from 'server/api/user/user.controller';
import { response } from 'jest-mock-express';
import { getUsers } from 'server/test/seedData';
import { init, mintRewardTokens, allocateRewards } from 'server/utils/ethereum';
import { CASHOUT_MAX } from 'server/config/globalConstants';
import { deployContract } from 'server/test/setup.eth';

process.env.TEST_SUITE = 'cashout';

describe('Cashout', () => {
  let { alice, bob, next, res } = {};

  beforeAll(async () => {
    const { address, provider } = await deployContract();
    await init(provider, address);
    ({ alice, bob } = getUsers());
    global.console.log = jest.fn(); // hides logs
  }, 60000);

  beforeEach(() => {
    res = response();
    next = jest.fn();
  });

  test('over the balance', async () => {
    const req = { user: alice, body: { customAmount: alice.balance + 1 } };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should not be able to cash out airdrop tokens', async () => {
    const req = { user: alice, body: { customAmount: alice.airdropTokens } };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('over the max cash out limit', async () => {
    bob.balance = CASHOUT_MAX + 1 + bob.airdropTokens;
    await bob.save();
    const req = { user: bob, body: { customAmount: CASHOUT_MAX + 1 } };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('cashout 0', async () => {
    const req = {
      user: alice,
      body: { customAmount: 0 }
    };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('cashout negative', async () => {
    const req = {
      user: alice,
      body: { customAmount: 0 }
    };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('cashout missing amount', async () => {
    const req = {
      user: alice,
      body: {}
    };
    await cashOut(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should mint tokens', async () => {
    await mintRewardTokens();
    await allocateRewards((10 * 10 ** 18).toString());
  }, 10000);

  test('cashout success', async () => {
    alice.balance = alice.airdropTokens + 20;
    await alice.save();
    const amnt = 10;
    const req = {
      user: alice,
      body: { customAmount: amnt }
    };
    await cashOut(req, res, next);
    const apiRes = res.json.mock.calls[0][0];
    expect(apiRes.user.cashOut.amount).toBe((amnt * 1e18).toString());
    const updatedUser = await User.findOne({ _id: alice._id });
    expect(updatedUser.cashedOut).toBe(amnt);
  });

  test('cashout one more time', async () => {
    const amnt = 10;
    const user = await User.findOneAndUpdate(
      { _id: alice._id },
      { cashOut: null },
      { new: true }
    );
    const req = {
      user,
      body: { customAmount: amnt }
    };
    const startCashout = user.cashedOut;
    await cashOut(req, res, next);
    const updatedUser = await User.findOne({ _id: alice._id });
    expect(updatedUser.cashedOut).toBe(amnt + startCashout);
  });
});
