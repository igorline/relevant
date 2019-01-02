import { Drizzle } from 'drizzle';
import RelevantCoin from 'app/contracts/RelevantCoin.json';

const networkId = 4;

const options = {
  contracts: [RelevantCoin],
  events: {},
  polls: {
    blocks: 100,
    accounts: 300
  },
  networkId,
  web3: {
    ignoreMetamask: true,
    useMetamask: true,
    fallback: global.web3
      ? null
      : {
        type: 'https',
        // TODO ENV?
        url: 'https://rinkeby.infura.io/eAeL7I8caPNjDe66XRTq',
        // type: 'ws',
        // url: 'ws://rinkeby.infura.io/_ws',
        networkId: 4
      }
  }
};

let drizzle;

export const initDrizzle = store => {
  drizzle = new Drizzle(options, store);
  return drizzle;
};

export const getDrizzle = () => drizzle;

