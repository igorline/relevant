import {
  init,
  isInitialized,
  getWeb3,
  getInstance,
  mintRewardTokens,
  allocateRewards,
  allocateAirdrops,
  getBalance,
  sign
} from 'server/utils/ethereum';

require('dotenv').config({ silent: true });

const devRewardsAddress = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
const testAcc = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b';
// const testKey = '6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c';

describe('ethRewards', () => {
  let web3;
  let instance;

  describe('init', () => {
    test('should initialize', async () => {
      await init();
      const initialized = isInitialized();
      expect(initialized).toBe(true);
      instance = getInstance();
      web3 = await getWeb3();

      web3.currentProvider.sendAsync(
        {
          jsonrpc: '2.0',
          method: 'evm_mine',
          params: [],
          id: new Date().getTime()
        },
        console.log // eslint-disable-line
      );

      web3.currentProvider.sendAsync(
        {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: new Date().getTime()
        },
        console.log // eslint-disable-line
      );
    });
  });

  describe('mintRewardTokens', () => {
    test('should be able to mint', async () => {
      const rounds = await instance.roundsSincleLast.call();
      console.log('rounds', rounds.toString()); // eslint-disable-line
      expect(rounds.toNumber()).toBeGreaterThan(0);
      // const owner = await instance.owner.call();
    });

    test('should mint tokens', async () => {
      await mintRewardTokens();
      await allocateRewards(100);
      await allocateAirdrops(100);
    });

    test('should get balance of dev account', async () => {
      const devTokens = await getBalance(devRewardsAddress);
      expect(devTokens).toBeGreaterThan(0);
    });

    test('should sign withdrawal', async () => {
      const testAmount = 0.000000000000001;
      const signature = await sign(testAcc, testAmount);
      expect(signature).toBeTruthy();

      const amountDec = new web3.utils.BN(testAmount * 10 ** 18);

      const tx = await instance.claimTokens(amountDec.toString(), signature, {
        from: testAcc
      });
      tx.logs.map(l => console.log('log args', l.args)); // eslint-disable-line

      const claimedTokens = await getBalance(testAcc);
      expect(claimedTokens).toBeGreaterThan(0);
    });
  });
});
