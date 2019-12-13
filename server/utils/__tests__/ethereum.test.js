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
import { deployContract, provider } from 'server/test/setup.eth';

const devRewardsAddress = '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0';

process.env.TEST_SUITE = 'ethereum';

describe('ethereum test', () => {
  let instance;
  let address;
  global.console.log = jest.fn(); // hides logs

  beforeAll(async () => {
    ({ address } = await deployContract());
  }, 60000);

  describe('init', () => {
    test('should initialize', async () => {
      await init(provider, address);
      const initialized = isInitialized();
      expect(initialized).toBe(true);
      instance = getInstance();
    });
  });

  describe('mintRewardTokens', () => {
    test('rewards sinse last round', async () => {
      const rounds = await instance.roundsSincleLast();
      expect(rounds.toNumber()).toBeGreaterThan(0);
    });

    test('should mint tokens', async () => {
      await mintRewardTokens();
      await allocateRewards((10 * 10 ** 18).toString());
      await allocateAirdrops((10 * 10 ** 18).toString());
    }, 20000);

    test('should get balance of dev account', async () => {
      const devTokens = await getBalance(devRewardsAddress);
      expect(devTokens).toBeGreaterThan(0);
    });

    test('should sign withdrawal', async () => {
      const owner = await instance.owner();
      const beforeTokens = await getBalance(owner);

      const testAmount = 10;
      const { sig } = await sign(owner, testAmount);
      expect(sig).toBeTruthy();

      const bn = (testAmount * 10 ** 18).toString();
      const r = await sendTx({ method: 'claimTokens', args: [bn, sig] });
      expect(r.status).toBe(1);

      const afterTokens = await getBalance(owner);
      expect(afterTokens - beforeTokens).toBe(testAmount);
    });
  });
});
