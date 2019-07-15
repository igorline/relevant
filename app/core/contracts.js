import Statesauce from 'redux-saga-web3-eth-contract';
import { getProvider, getRpcUrl, getMetamask } from 'app/utils/eth';
import RelevantToken from '../contracts/RelevantToken';
import { NETWORK_NUMBER } from './config';

const web3 = getProvider({
  rpcUrl: getRpcUrl(),
  metamask: getMetamask()
});

export const tokenAddress = RelevantToken.networks[NETWORK_NUMBER].address;

export const instance = new Statesauce(RelevantToken.contractName, RelevantToken.abi, {
  at: tokenAddress,
  web3Instance: web3
});

export const { contract, types, actions, reducer, selectors, saga } = instance;