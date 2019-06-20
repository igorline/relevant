import {
  init,
  isInitialized,
  getInstance,
  mintRewardTokens,
  allocateRewards,
  allocateAirdrops,
  getBalance,
  sign,
  sendTx
} from 'server/utils/ethereum';

require('dotenv').config({ silent: true });

const devRewardsAddress = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';

describe('ethRewards', () => {
  let instance;

  describe('init', () => {
    test('should initialize', async () => {
      await init();
      const initialized = isInitialized();
      expect(initialized).toBe(true);
      instance = getInstance();
    });
  });

  describe('mintRewardTokens', () => {
    test('rewards sinse last round', async () => {
      const rounds = await instance.roundsSincleLast();
      console.log('rounds', rounds.toString()); // eslint-disable-line
      expect(rounds.toNumber()).toBeGreaterThan(0);
    });

    test('should mint tokens', async () => {
      await mintRewardTokens();
      await allocateRewards((10 * 10 ** 18).toString());
      await allocateAirdrops(100);
    });

    test('should get balance of dev account', async () => {
      const devTokens = await getBalance(devRewardsAddress);
      expect(devTokens).toBeGreaterThan(0);
    });

    test('should sign withdrawal', async () => {
      const owner = await instance.owner();
      const beforeTokens = await getBalance(owner);

      const testAmount = 10;
      const signature = await sign(owner, testAmount);
      expect(signature).toBeTruthy();

      const bn = (testAmount * 10 ** 18).toString();
      const r = await sendTx({ method: 'claimTokens', args: [bn, signature] });
      expect(r.status).toBe(1);

      const afterTokens = await getBalance(owner);
      expect(afterTokens - beforeTokens).toBe(testAmount);
    });
  });
});
