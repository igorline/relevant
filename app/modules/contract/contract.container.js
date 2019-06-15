import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, tokenAddress, selectors } from 'core/contracts';
import { selectUserBalance } from './contract.selectors';

export const mapContractState = (state, { accounts }) => ({
  web3: state.web3,
  web3Status: {
    isInitialized: state.web3.init.isInitialized,
    status: state.web3.init.status
  },
  address: accounts && accounts[0],
  accounts: state.web3.accounts.items && state.web3.accounts.items,
  userBalance: selectUserBalance(state, tokenAddress),
  RelevantToken: state.RelevantToken,
  methodCache: {
    select: method => selectors.methods[method]({ at: tokenAddress })(state)
  }
});

export const mapContractDispatch = dispatch => ({
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
});

export default function ContractProvider(Component) {
  return withRouter(
    connect(
      mapContractState,
      mapContractDispatch
    )(Component)
  );
}

export const contractPropTypes = {
  web3: PropTypes.object,
  web3Status: PropTypes.object,
  web3Actions: PropTypes.object,
  methodCache: PropTypes.object,
  cacheMethod: PropTypes.func,
  cacheEvent: PropTypes.func,
  cacheSend: PropTypes.func,
  accounts: PropTypes.array,
  userBalance: PropTypes.object
};
