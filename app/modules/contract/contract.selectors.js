import { selectors } from 'core/contracts';

export const selectUserBalance = (state, tokenAddress) =>
  selectors.methods.balanceOf({ at: tokenAddress })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );

export const selectCashOut = (state, tokenAddress) =>
  selectors.methods.cashOut({ at: tokenAddress })(
    state,
    state.web3.accounts.items && state.web3.accounts.items[0]
  );