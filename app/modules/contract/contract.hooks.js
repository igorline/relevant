import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getProvider, getMetamask, formatBN } from 'app/utils/eth';
import { bindActionCreators } from 'redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, tokenAddress } from 'core/contracts';
import { alert } from 'app/utils';
import { useWeb3State, useRelevantState } from './contract.selectors';

const Alert = alert.Alert();
const _web3 = getProvider();

export const useWeb3Actions = () => {
  const dispatch = useDispatch();
  return {
    init: useCallback(web3Instance => dispatch(_web3Actions.init.init(web3Instance)), [
      dispatch
    ]),
    network: useCallback(
      () => bindActionCreators({ ..._web3Actions.network, dispatch }),
      [dispatch]
    ),
    accounts: useCallback(
      () => bindActionCreators({ ..._web3Actions.accounts, dispatch }),
      [dispatch]
    )
  };
};

export const useRelevantActions = () => {
  const dispatch = useDispatch();
  return {
    getEvent: useCallback(
      event => {
        dispatch(tokenActions.events[event].get({ at: tokenAddress }));
      },
      [dispatch]
    ),
    subscribeToEvent: useCallback(
      event => {
        dispatch(tokenActions.events[event].get({ at: tokenAddress }));
        dispatch(tokenActions.events[event].subscribe({ at: tokenAddress }));
      },
      [dispatch]
    ),
    cacheMethod: useCallback(
      (method, args) => {
        // if (!method) return;
        if (args) dispatch(tokenActions.methods[method]({ at: tokenAddress }).call(args));
        else dispatch(tokenActions.methods[method]({ at: tokenAddress }).call());
      },
      [dispatch]
    ),
    cacheSend: useCallback(
      (method, options, ...args) => {
        if (args) {
          dispatch(
            tokenActions.methods[method]({
              at: tokenAddress,
              ...options
            }).send(...args)
          );
        } else {
          dispatch(
            tokenActions.methods[method]({
              at: tokenAddress,
              ...options
            }).send()
          );
        }
      },
      [dispatch]
    )
  };
};

export const useWeb3 = () => {
  useMetamask();
  const web3 = useWeb3State();
  const { init } = useWeb3Actions();
  useEffect(() => {
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

  useEffect(() => {
    if (!metamask) return () => {};
    try {
      metamask.enable();
    } catch (err) {
      return () => {};
    }
    metamask.autoRefreshOnNetworkChange = false;

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
  const { cacheMethod, subscribeToEvent } = useRelevantActions();
  const haveBalance = !!userBalance;

  useEffect(() => {
    subscribeToEvent('Transfer');
    if (accounts && accounts.length && !haveBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, haveBalance, cacheMethod, subscribeToEvent]);

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

// Rerturns [Accounts, Relevant State, Relevant Actions]
export const useTokenContract = () => {
  const relevantState = useRelevantState();
  const web3 = useWeb3State();
  const relevantActions = useRelevantActions();
  useWeb3();
  useBalance();
  // useEventSubscription(ethActions);
  return [web3.accounts, relevantState, relevantActions];
};

export const useTxState = ({ tx, method, callback }) => {
  const { methodCache } = useRelevantState();
  if (!tx) return null;

  const txState = methodCache.select(method, ...tx.payload.args);

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
