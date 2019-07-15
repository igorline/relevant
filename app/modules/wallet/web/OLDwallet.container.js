import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { BondedTokenContainer } from 'bonded-token';
import * as authActions from 'modules/auth/auth.actions';
import * as earningsActions from 'modules/wallet/earnings.actions';
import Eth from 'modules/web_ethTools/eth.context';
import MetaMaskCta from 'modules/web_splash/metaMaskCta.component';
import { initDrizzle } from 'app/utils/eth';
import Wallet from './OLDwallet.component';
import Balance from './OLDbalance.component';

if (process.env.BROWSER === true) {
  require('./wallet.css');
}

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
    this.props.actions.getEarnings();
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
    // TODO - edge case needs to be fixed inside bonded component
    // this throws error with HMR
    // BondedContainer needs to check that contract is initialized in propsToState method
    if (contract && !contract.initialized) return null;
    return (
      <div style={{ flex: 1 }}>
        <div className={'banner'}>{this.renderHeader()}</div>
        <BondedTokenContainer {...this.props}>
          <div className={'pageContainer column'}>
            <Eth.Consumer>
              {wallet => <Balance wallet={wallet} {...this.props} />}
            </Eth.Consumer>
            <Wallet user={this.props.user} />
          </div>
        </BondedTokenContainer>
      </div>
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
    earnings: state.earnings,
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
      ...authActions,
      ...earningsActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer);
