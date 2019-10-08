import User from 'server/api/user/user.model';
import { cashOut } from 'server/api/user/user.controller';
import { response } from 'jest-mock-express';
import { getUsers } from 'server/test/seedData';
import { init } from 'server/utils/ethereum';
import { CASHOUT_MAX } from 'server/config/globalConstants';

require('dotenv').config({ silent: true });

describe('Cashout', () => {
  let { alice, bob, next, res } = {};

  beforeAll(async () => {
    await init();
    ({ alice, bob } = getUsers());
    // global.console = { log: jest.fn() }; // hides logs
  });

  beforeEach(() => {
    res = response();
    next = jest.fn();
  });

  test('over the balance', async () => {
    const req = { user: alice, body: { customAmount: alice.balance + 1 } };
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

  test('cashout success', async () => {
    alice.balance = 100 + bob.airdropTokens;
    await bob.save();
    const req = {
      user: alice,
      body: { customAmount: 100 }
    };
    await cashOut(req, res, next);
    const apiRes = res.json.mock.calls[0][0];
    expect(apiRes.cashOut.amount).toBe((100 * 1e18).toString());
    const updatedUser = await User.findOne({ _id: alice._id });
    expect(updatedUser.cashedOut).toBe(100);
  });
});
