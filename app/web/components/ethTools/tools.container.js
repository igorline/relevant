import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BondedTokenUtils } from 'bonded-token';
import * as authActions from '../../../actions/auth.actions';
import Eth from './eth.context';

class EthTools extends Component {
  static propTypes = {
    account: PropTypes.string,
    user: PropTypes.object,
    RelevantCoin: PropTypes.object,
  }
  initialState = {
    balance: 0,
    connectedBalance: 0,
    account: null,
    connectedAccount: null,
    differentAccount: null,
    network: null,
    status: null,
    nonce: null,
  }
  state = {
    balance: 0,
  }

  static getDerivedStateFromProps(nextProps) {
    let props = nextProps;
    let user = nextProps.user;
    let balance = 0;
    let connectedAccount = null;
    let account = null;
    let connectedBalance;
    const network = nextProps.network;
    const status = nextProps.status;
    let differentAccount = true;
    let nonce = null;

    account = props.account;
    if (!user) {
      return this.initialState;
    }
    connectedAccount = user.ethAddress ? user.ethAddress[0] : null;

    if (!connectedAccount && !account) return this.initialState;

    if (account) {
      balance = BondedTokenUtils.getValue(props.RelevantCoin, 'balanceOf', account);
    }
    differentAccount = account !== connectedAccount;
    if (connectedAccount) {
      connectedBalance = BondedTokenUtils.getValue(props.RelevantCoin, 'balanceOf', connectedAccount);
    }
    // nonce won't be correct the first time
    if (props.RelevantCoin && props.RelevantCoin.methods && connectedAccount) {
      nonce = props.RelevantCoin.methods.nonceOf.cacheCall(connectedAccount);
      nonce = parseInt(nonce, 0);
    }
    return { nonce, balance, account, connectedAccount, connectedBalance, differentAccount, network, status };
  }

  render() {
    return (
      <Eth.Provider value={this.state}>
        {this.props.children}
      </Eth.Provider>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  account: state.accounts[0],
  RelevantCoin: state.contracts.RelevantCoin,
  network: state.web3.networkId,
  status: state.web3.status
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ ...authActions }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EthTools);
