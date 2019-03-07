import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as authActions from 'modules/auth/auth.actions';
import { toNumber } from 'app/utils/numbers';
import Eth from './eth.context';

class EthTools extends Component {
  static propTypes = {
    account: PropTypes.string,
    user: PropTypes.object,
    RelevantCoin: PropTypes.object,
    children: PropTypes.node,
    network: PropTypes.number,
    status: PropTypes.string
  };

  state = {
    balance: 0,
    connectedBalance: 0,
    account: null,
    connectedAccount: null,
    differentAccount: null,
    network: null,
    status: null,
    nonce: null
  };

  queryBalance(address) {
    const { RelevantCoin } = this.props;
    if (address && RelevantCoin && RelevantCoin.initialized) {
      RelevantCoin.methods.balanceOf.cacheCall(address);
      RelevantCoin.methods.nonceOf.fromCache(address);
    }
  }

  static getDerivedStateFromProps(nextProps) {
    const { account, RelevantCoin, network, status, user } = nextProps;

    if (!RelevantCoin || !RelevantCoin.initialized) return null;

    let balance = 0;
    let connectedAccount = null;
    let connectedBalance;
    let differentAccount = true;
    let nonce = null;

    if (!user) return null;

    const decimals = toNumber(RelevantCoin.methods.decimals.fromCache(), 0);

    connectedAccount = user.ethAddress ? user.ethAddress[0] : null;

    if (!connectedAccount && !account) return null;

    if (account) {
      balance = toNumber(RelevantCoin.methods.balanceOf.fromCache(account), decimals);
    }

    if (connectedAccount) {
      connectedBalance = toNumber(
        RelevantCoin.methods.balanceOf.fromCache(connectedAccount),
        decimals
      );
    }

    differentAccount = account !== connectedAccount;

    // nonce won't be correct the first time
    if (RelevantCoin && RelevantCoin.methods && connectedAccount) {
      nonce = RelevantCoin.methods.nonceOf.fromCache(connectedAccount);
      nonce = parseInt(nonce, 0);
    }
    return {
      nonce,
      balance,
      account,
      connectedAccount,
      connectedBalance,
      differentAccount,
      network,
      status
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { account, user } = this.props;
    if (!user) return;
    const connectedAccount = user.ethAddress ? user.ethAddress[0] : null;
    if (connectedAccount && connectedAccount !== prevState.connectedAccount) {
      this.queryBalance(connectedAccount);
    }
    if (account && account !== prevState.account) {
      this.queryBalance(account);
    }
  }

  render() {
    return <Eth.Provider value={this.state}>{this.props.children}</Eth.Provider>;
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  account: state.accounts[0],
  RelevantCoin: state.contracts.RelevantCoin,
  network: state.web3.networkId,
  status: state.web3.status
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EthTools);
