import { useEffect } from 'react';
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
      init(web3Instance) {
        dispatch(_web3Actions.init.init(web3Instance));
      },
      network: bindActionCreators({ ..._web3Actions.network }, dispatch),
      accounts: bindActionCreators({ ..._web3Actions.accounts }, dispatch),
      onAccountsChanged() {
        metamask.on('accountsChanged', _accounts =>
          dispatch(_web3Actions.accounts.getSuccess(_accounts))
        );
      }
    },
    Relevant: {
      cacheEvent(event) {
        dispatch(tokenActions.events[event].get({ at: tokenAddress }));
        dispatch(tokenActions.events[event].subscribe({ at: tokenAddress }));
      },
      cacheMethod(method, args) {
        if (args) dispatch(tokenActions.methods[method]({ at: tokenAddress }).call(args));
        else dispatch(tokenActions.methods[method]({ at: tokenAddress }).call());
      },
      cacheSend(method, options, ...args) {
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
      }
    }
  };
};

export const useWeb3 = () => {
  const { web3 } = useEthState();
  const ethActions = useEthActions();
  useEffect(() => {
    if (!web3.isInitialized) ethActions.web3.init(_web3);
  }, [web3.status, web3.isInitialized, ethActions.web3]);

  return [web3.accounts, web3.isInitialized, web3.networkId];
};

export const useMetamask = () => {
  const { web3 } = useEthActions();
  useEffect(() => {
    if (metamask && web3) web3.onAccountsChanged();
    return () => {
      metamask.autoRefreshOnNetworkChange = false;
    };
  }, [web3]);
};

export const useBalance = () => {
  const {
    web3: { accounts },
    Relevant: { userBalance }
  } = useEthState();
  const {
    Relevant: { cacheMethod }
  } = useEthActions();
  useEffect(() => {
    if (accounts && accounts.length && !userBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, userBalance, cacheMethod]);

  return userBalance;
};

export const useEventSubscription = ({ Relevant: { cacheEvent } }) => {
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
