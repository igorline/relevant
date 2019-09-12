import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getProvider, getMetamask } from 'app/utils/eth';
import { bindActionCreators } from 'redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, tokenAddress } from 'core/contracts';
import { useEthState } from './contract.selectors';

const _web3 = getProvider();
const metamask = getMetamask();

export const useEthActions = () => {
  const dispatch = useDispatch();
  return {
    web3: {
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
    },
    Relevant: {
      cacheEvent: useCallback(
        event => {
          dispatch(tokenActions.events[event].get({ at: tokenAddress }));
          dispatch(tokenActions.events[event].subscribe({ at: tokenAddress }));
        },
        [dispatch]
      ),
      cacheMethod: useCallback(
        (method, args) => {
          if (args)
            dispatch(tokenActions.methods[method]({ at: tokenAddress }).call(args));
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
    }
  };
};

export const useWeb3 = () => {
  const { web3 } = useEthState();
  const ethActions = useEthActions();
  const initWeb3 = ethActions.web3.init;
  useEffect(() => {
    if (!web3.isInitialized) initWeb3(_web3);
  }, [web3.status, web3.isInitialized, initWeb3]);

  return [web3.accounts, web3.isInitialized, web3.networkId];
};

// Perhaps this should not be an effect?
// This is just global metamask setup that should be done once.
// But we need to consider the case where we start out with no metamask and then enable metamask.
export const useMetamask = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!metamask) return null;
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
  }, [dispatch]);
};

export const useBalance = () => {
  const {
    web3: { accounts },
    Relevant: { userBalance }
  } = useEthState();
  const {
    Relevant: { cacheMethod }
  } = useEthActions();
  const haveBalance = !!userBalance;
  useEffect(() => {
    if (accounts && accounts.length && !haveBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, haveBalance, cacheMethod]);

  return userBalance;
};

export const useEventSubscription = () => {
  const {
    Relevant: { cacheEvent }
  } = useEthActions();
  useEffect(() => {
    cacheEvent('Released');
    return () => {};
  }, [cacheEvent]);
};

// Rerturns [Accounts, Relevant State, Relevant Actions]
export const useTokenContract = () => {
  const ethActions = useEthActions();
  const ethState = useEthState();
  useWeb3();
  useMetamask();
  useBalance();
  // useEventSubscription(ethActions);
  return [ethState.web3.accounts, ethState.Relevant, ethActions.Relevant];
};
