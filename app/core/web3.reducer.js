import { combineReducers } from 'redux';
import { reducers } from 'redux-saga-web3';

export const web3Reducers = combineReducers({ ...reducers });

export const { accounts, blocks, init, network, context } = reducers;
