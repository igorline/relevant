import { useSelector } from 'react-redux';
import { tokenAddress, selectors } from 'core/contracts';

export const selectUserBalance = (state, address) =>
  selectors.methods.balanceOf({ at: address })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectUserNonce = (state, address) =>
  selectors.methods.nonceOf({ at: address })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectCashOut = (state, address) =>
  selectors.methods.cashOut({ at: address })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const useWeb3State = () =>
  useSelector(state => ({
    web3: state.web3,
    status: state.web3.init.status,
    isInitialized: state.web3.init.isInitialized,
    networkId: state.web3.network.id && state.web3.network.id,
    accounts: state.web3.accounts.items && state.web3.accounts.items,
    address: state.web3.accounts.items && state.web3.accounts.items[0]
  }));

export const useRelevantState = () =>
  useSelector(state => ({
    userNonce: selectUserNonce(state, tokenAddress),
    userBalance: selectUserBalance(state, tokenAddress),
    RelevantToken: state.RelevantToken,
    methodCache: {
      select: (method, args = []) =>
        selectors.methods[method]({ at: tokenAddress })(state, ...args)
    }
  }));
