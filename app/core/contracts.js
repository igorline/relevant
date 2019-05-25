import Statesauce from 'redux-saga-web3-eth-contract';
import { initProvider } from 'modules/web_ethTools/utils';
import RelevantToken from '../contracts/RelevantToken';

const CONTRACT_NAME = 'RelevantToken';
const tokenAddress = '0xd05e0e497a570Ad0a1402375561293Bd01e9cb73';

const web3 = initProvider();
const backupProvider = 'wss://rinkeby.infura.io/ws/v3/5c38fb06b79445928b582019d6a72e57';

export const instance = new Statesauce(CONTRACT_NAME, RelevantToken.abi, {
  at: tokenAddress,
  web3Instance: web3,
  provider: backupProvider
});

const { contract, types, actions, reducer, selectors, saga } = instance;
export { contract, types, actions, reducer, selectors, saga, tokenAddress };
