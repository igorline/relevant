import { useEffect } from 'react';
import { getProvider, getMetamask } from 'modules/web_ethTools/utils';

const web3 = getProvider();
const metamask = getMetamask();

export const useTokenContract = (
  web3Status,
  web3Actions,
  cacheMethod,
  accounts,
  userBalance
) => {
  useEffect(() => {
    if (!web3Status.isInitialized) web3Actions.init(web3);
  }, [web3Status.status]);
  useEffect(() => {
    if (metamask) web3Actions.onAccountsChanged(metamask);
    return () => {
      metamask.autoRefreshOnNetworkChange = false;
    };
  }, []);
  useEffect(() => {
    if (accounts && accounts.length && !userBalance) {
      cacheMethod('balanceOf', accounts[0]);
    }
  }, [accounts, userBalance]);
};
