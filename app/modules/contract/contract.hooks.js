import { useEffect } from 'react';
import { getProvider, getMetamask } from 'app/utils/eth';

const _web3 = getProvider();
const metamask = getMetamask();

export const useWeb3 = ({ web3 }, ethActions) => {
  useEffect(() => {
    if (!web3.isInitialized) ethActions.web3.init(_web3);
  }, [web3.status]);

  return [web3.accounts, web3.isInitialized, web3.networkId];
};

export const useMetamask = ({ web3 }) => {
  useEffect(() => {
    if (metamask) web3.onAccountsChanged(metamask);
    return () => {
      metamask.autoRefreshOnNetworkChange = false;
    };
  }, []);
};

export const useBalance = (
  { web3: { accounts }, Relevant: { userBalance } },
  { Relevant: { cacheMethod } }
) => {
  useEffect(() => {
    if (accounts && accounts.length && !userBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, userBalance]);

  return userBalance;
};

export const useEventSubscription = ({ Relevant: { cacheEvent } }) => {
  useEffect(() => {
    cacheEvent('Released');
    return () => {};
  }, []);
};

// Rerturns [Accounts, Relevant State, Relevant Actions]
export const useTokenContract = (ethState, ethActions) => {
  useWeb3(ethState, ethActions);
  useMetamask(ethActions);
  useBalance(ethState, ethActions);
  useEventSubscription(ethActions);

  return [ethState.web3.accounts, ethState.Relevant, ethActions.Relevant];
};
