import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, tokenAddress, selectors } from 'core/contracts';
import { selectUserBalance } from './contract.selectors';

const mapStateToProps = (state, { accounts }) => ({
  web3Status: {
    isInitialized: state.web3.init.isInitialized,
    status: state.web3.init.status
  },
  address: accounts && accounts[0],
  accounts: state.web3.accounts.items && state.web3.accounts.items,
  userBalance: selectUserBalance(state, tokenAddress),
  methodCache: {
    select: method => selectors.methods[method]({ at: tokenAddress })(state)
  }
});

const mapDispatchToProps = dispatch => ({
  web3Actions: {
    init(web3Instance) {
      dispatch(_web3Actions.init.init(web3Instance));
    },
    onAccountsChanged(metamask) {
      metamask.on('accountsChanged', _accounts =>
        dispatch(_web3Actions.accounts.getSuccess(_accounts))
      );
    }
  },
  cacheMethod(method, args) {
    if (args) dispatch(tokenActions.methods[method]({ at: tokenAddress }).call(args));
    else dispatch(tokenActions.methods[method]({ at: tokenAddress }).call());
  }
});

export default function ContractProvider(Component) {
  return withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Component)
  );
}
