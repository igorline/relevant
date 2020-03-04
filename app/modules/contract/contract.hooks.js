import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { formatBN } from 'utils/eth';
import { getProvider, getMetamask } from 'utils/web3.provider';
import { bindActionCreators } from 'redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { alert } from 'app/utils';
import { useWeb3State, useRelevantState } from './contract.selectors';
import { useContract } from './contract.context';

const Alert = alert.Alert();
const _web3 = getProvider();

export const useWeb3Actions = () => {
  const dispatch = useDispatch();
  return {
    init: useCallback(web3Instance => dispatch(_web3Actions.init.init(web3Instance)), [
      dispatch
    ]),
    network: bindActionCreators({ ..._web3Actions.network }, dispatch),
    accounts: bindActionCreators({ ..._web3Actions.accounts }, dispatch)
  };
};

export const useRelevantActions = () => {
  const { actions: tokenActions, tokenAddress } = useContract();
  const dispatch = useDispatch();
  const actions = {
    getEvent: useCallback(
      event => {
        dispatch(tokenActions.events[event].get({ at: tokenAddress }));
      },
      [dispatch, tokenActions, tokenAddress]
    ),
    subscribeToEvent: useCallback(
      event => {
        dispatch(tokenActions.events[event].get({ at: tokenAddress }));
        return dispatch(tokenActions.events[event].subscribe({ at: tokenAddress }));
      },
      [dispatch, tokenActions, tokenAddress]
    ),
    call: useCallback(
      (method, args) => {
        if (args)
          return dispatch(tokenActions.methods[method]({ at: tokenAddress }).call(args));
        return dispatch(tokenActions.methods[method]({ at: tokenAddress }).call());
      },
      [dispatch, tokenActions, tokenAddress]
    ),
    send: useCallback(
      (method, options, ...args) => {
        if (args) {
          return dispatch(
            tokenActions.methods[method]({
              at: tokenAddress,
              ...options
            }).send(...args)
          );
        }
        return dispatch(
          tokenActions.methods[method]({
            at: tokenAddress,
            ...options
          }).send()
        );
      },
      [dispatch, tokenActions, tokenAddress]
    )
  };
  return tokenActions ? actions : {};
};

export const useWeb3 = () => {
  useContract();
  useMetamask();
  const web3 = useWeb3State();
  const { init } = useWeb3Actions();
  useEffect(() => {
    // TODO this init function opens a connect popup which prevents
    // the display of a custom popup (like connect/signature)
    if (!web3.isInitialized) init(_web3);
  }, [web3.status, web3.isInitialized, init]);
  return [web3.accounts, web3.isInitialized, web3.networkId];
};

// Perhaps this should not be an effect?
// This is just global metamask setup that should be done once.
// But we need to consider the case where we start out with no metamask and then enable metamask.
export const useMetamask = () => {
  const dispatch = useDispatch();
  const metamask = getMetamask();
  if (metamask) metamask.autoRefreshOnNetworkChange = false;

  useEffect(() => {
    if (!metamask) return () => {};
    try {
      metamask.enable();
    } catch (err) {
      return () => {};
    }

    const getAccounts = _accounts =>
      dispatch(_web3Actions.accounts.getSuccess(_accounts));
    const getNetworkId = () => dispatch(_web3Actions.network.getId());

    metamask.on('accountsChanged', getAccounts);
    metamask.on('networkChanged', getNetworkId);
    return () => {
      metamask.off('accountsChanged', getAccounts);
      metamask.off('networkChanged', getNetworkId);
    };
  }, [dispatch, metamask]);
  return metamask;
};

export const useBalance = () => {
  const { accounts } = useWeb3State();
  const { userBalance } = useRelevantState();
  const { call, subscribeToEvent } = useRelevantActions();
  const haveBalance = !!userBalance;

  useEffect(() => {
    subscribeToEvent && subscribeToEvent('Transfer');
    if (accounts && accounts.length && !haveBalance) {
      call && call('balanceOf', accounts[0]);
    }
  }, [accounts, haveBalance, call, subscribeToEvent]);

  const relCoins =
    userBalance && userBalance.phase === 'SUCCESS'
      ? formatBN(userBalance.value, 18)
      : null;

  return relCoins;
};

export const useEventSubscription = () => {
  const { subscribeToEvent } = useRelevantActions();
  useEffect(() => {
    subscribeToEvent('Released');
  }, [subscribeToEvent]);
};

// DEPRECATED backwards compatability

// Rerturns [Accounts, Relevant State, Relevant Actions]
export const useTokenContract = () => {
  useContract();
  const { getState } = useRelevantState();
  const web3 = useWeb3State();
  const { call, send } = useRelevantActions();
  useWeb3();
  useBalance();
  // useEventSubscription(ethActions);
  return [
    web3.accounts,
    { methodCache: { select: getState } },
    { cacheMethod: call, cacheSend: send }
  ];
};

// Rerturns [Accounts, Relevant State, Relevant Actions]
export const useRelevantToken = () => {
  useContract();
  const { getState } = useRelevantState();
  const web3 = useWeb3State();
  const { call, send } = useRelevantActions();
  useWeb3();
  useBalance();
  // useEventSubscription(ethActions);
  return { accounts: web3.accounts, getState, call, send };
};

export const useTxState = ({ tx, method, callback }) => {
  const { getState } = useRelevantState();
  if (!tx || !getState) return null;

  const txState = getState(method, ...tx.payload.args);

  if (txState && txState.phase === 'RECEIPT') {
    Alert.alert('Transaction Completed!', 'success');
    callback();
    return 'success';
  }

  if (txState && txState.phase === 'ERROR') {
    Alert.alert(txState.value.get('message'));
    callback();
    return 'error';
  }

  return 'pending';
};
