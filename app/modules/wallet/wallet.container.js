import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import * as authActions from 'modules/auth/auth.actions';
import Eth from 'modules/web_ethTools/eth.context';
import MetaMaskCta from 'modules/web_splash/metaMaskCta.component';
import { initDrizzle } from 'app/utils/eth';
// import Wallet from 'modules/wallet/wallet.component';
import Balance from 'modules/wallet/balance.component';
import { View } from 'modules/styled/uni';

let drizzle;

class WalletContainer extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object
  };

  static contextTypes = {
    store: PropTypes.object
  };

  componentDidMount() {
    const { isAuthenticated } = this.props.auth;
    if (isAuthenticated) {
      // eslint-disable-next-line
      drizzle = initDrizzle(this.context.store);
    }
  }

  componentDidUpdate(prevProps) {
    const { isAuthenticated } = this.props.auth;
    if (isAuthenticated && !prevProps.auth.isAuthenticated && !drizzle) {
      drizzle = initDrizzle(this.context.store);
    }
  }

  renderHeader() {
    if (this.props.user && this.props.user.ethAddress && this.props.user.ethAddress[0]) {
      return null;
    }
    return <Eth.Consumer>{wallet => <MetaMaskCta {...wallet} />}</Eth.Consumer>;
  }

  render() {
    const { contract } = this.props;
    if (contract && !contract.initialized) return null;
    return (
      <View flex={1} fdirection="row">
        <View flex={1}>
          <Eth.Consumer>
            {wallet => <Balance wallet={wallet} {...this.props} />}
          </Eth.Consumer>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.auth.user,
    drizzleStatus: state.drizzleStatus,
    contract: state.contracts.RelevantCoin,
    accounts: state.accounts,
    contracts: state.contracts,
    accountBalances: state.accountBalances,
    drizzle: {
      transactions: state.transactions,
      web3: state.web3,
      transactionStack: state.transactionStack
    }
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer);
