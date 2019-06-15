import { useEffect } from 'react';
import { getProvider, getMetamask } from 'modules/web_ethTools/utils';

const web3 = getProvider();
const metamask = getMetamask();

export const useWeb3 = (web3Status, web3Actions) => {
  useEffect(() => {
    if (!web3Status.isInitialized) web3Actions.init(web3);
  }, [web3Status.status]);
};

export const useMetamask = web3Actions => {
  useEffect(() => {
    if (metamask) web3Actions.onAccountsChanged(metamask);
    return () => {
      metamask.autoRefreshOnNetworkChange = false;
    };
  }, []);
};

export const useBalance = (accounts, userBalance, cacheMethod) => {
  useEffect(() => {
    if (accounts && accounts.length && !userBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, userBalance]);
};

export const useEventSubscription = cacheEvent => {
  useEffect(() => {
    cacheEvent('Released');
    return () => {};
  }, []);
};
export const useTokenContract = (
  web3Status,
  web3Actions,
  cacheMethod,
  cacheEvent,
  accounts,
  userBalance
) => {
  useWeb3(web3Status, web3Actions);
  useMetamask(web3Actions);
  useBalance(accounts, userBalance, cacheMethod);
  useEventSubscription(cacheEvent);
};
