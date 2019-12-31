import Statesauce from 'redux-saga-web3-eth-contract';
import { getProvider, getRpcUrl, getMetamask } from 'app/utils/eth';
import get from 'lodash/get';
import { combineReducers } from 'redux';
import { reducers, sagas } from 'redux-saga-web3';
import { all, fork } from 'redux-saga/effects';
import RelevantToken from 'app/contracts/RelevantToken';
import { NETWORK_NUMBER } from 'app/core/config';

export function* web3Sagas() {
  yield all([...Object.values(sagas).map(saga => fork(saga))]);
}

export const web3Reducers = combineReducers({ ...reducers });

export const { accounts, blocks, init, network, context } = reducers;

const web3 = getProvider({
  rpcUrl: getRpcUrl(),
  metamask: getMetamask()
});

export const tokenAddress = get(RelevantToken, `networks.${NETWORK_NUMBER}.address`);

export const instance = new Statesauce(RelevantToken.contractName, RelevantToken.abi, {
  at: tokenAddress,
  web3Instance: web3
});

export const { contract, types, actions, reducer, selectors, saga } = instance;
