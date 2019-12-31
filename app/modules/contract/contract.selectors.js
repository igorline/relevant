import { useSelector } from 'react-redux';
import { parseBN } from 'app/utils/eth';
import { useContract } from './contract.context';

export const selectUserBalance = (selectors, state, address) =>
  selectors.methods.balanceOf({ at: address })(
    state,
    state.web3 && state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectUserNonce = (selectors, state, address) =>
  selectors.methods.nonceOf({ at: address })(
    state,
    state.web3 && state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectCashOut = (selectors, state, address) =>
  selectors.methods.cashOut({ at: address })(
    state,
    state.web3 && state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const formatSelection = el => {
  if (!el) return {};
  const value = typeof parseBN(el.value) !== 'number' ? parseBN(el.value) : el.value;
  return { ...el, value };
};

export const useWeb3State = () => {
  useContract();
  return useSelector(state => ({
    web3: state.web3,
    status: state.web3 && state.web3.init.status,
    isInitialized: state.web3 && state.web3.init.isInitialized,
    networkId: state.web3 && state.web3.network.id && state.web3.network.id,
    accounts: state.web3 && state.web3.accounts.items && state.web3.accounts.items,
    address: state.web3 && state.web3.accounts.items && state.web3.accounts.items[0]
  }));
};

export const useRelevantState = () => {
  const { selectors, tokenAddress, initialized } = useContract();
  return useSelector(state => {
    return initialized
      ? {
          userNonce: selectUserNonce(selectors, state, tokenAddress),
          userBalance: selectUserBalance(selectors, state, tokenAddress),
          RelevantToken: state.RelevantToken,
          getState: (method, ...args) =>
            selectors.methods[method]
              ? formatSelection(
                  selectors.methods[method]({ at: tokenAddress })(state, ...args)
                )
              : {},
          eventCache: event => selectors.events[event]
        }
      : { getState: () => ({}) };
  });
};
