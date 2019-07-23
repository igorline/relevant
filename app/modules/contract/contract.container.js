import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as _web3Actions } from 'redux-saga-web3';
import { actions as tokenActions, tokenAddress, selectors } from 'core/contracts';
import { selectUserBalance } from './contract.selectors';

// TODO -- comine state and actions into one object each
export const mapContractState = state => ({
  ethState: {
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
  }
});

export const mapContractDispatch = dispatch => ({
  ethActions: {
    web3: {
      init(web3Instance) {
        dispatch(_web3Actions.init.init(web3Instance));
      },
      network: bindActionCreators({ ..._web3Actions.network }, dispatch),
      accounts: bindActionCreators({ ..._web3Actions.accounts }, dispatch),
      onAccountsChanged(metamask) {
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
  ethState: PropTypes.object,
  ethActions: PropTypes.object
};
