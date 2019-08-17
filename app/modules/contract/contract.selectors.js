import { useSelector } from 'react-redux';
import { tokenAddress, selectors } from 'core/contracts';

export const selectUserBalance = (state, address) =>
  selectors.methods.balanceOf({ at: address })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectCashOut = (state, address) =>
  selectors.methods.cashOut({ at: address })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const useEthState = () =>
  useSelector(state => ({
    web3: {
      web3: state.web3,
      status: state.web3.init.status,
      isInitialized: state.web3.init.isInitialized,
      networkId: state.web3.network.id && state.web3.network.id,
      accounts: state.web3.accounts.items && state.web3.accounts.items,
      address: state.web3.accounts.items && state.web3.accounts.items[0]
    },
    Relevant: {
      userBalance: selectUserBalance(state, tokenAddress),
      RelevantToken: state.RelevantToken,
      methodCache: {
        select: method => selectors.methods[method]({ at: tokenAddress })(state)
      }
    }
  }));
