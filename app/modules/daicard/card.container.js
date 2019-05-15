import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { addWalletAddress } from 'modules/auth/auth.actions';
import { localStorage } from 'app/utils/storage';
import { getChannelBalanceInUSD } from './utils/currencyFormatting';
import * as cardActions from './card.actions';

let daicard;
let CHANNEL_DEPOSIT_MAX;
if (process.env.BROWSER === true) {
  daicard = require('./utils/connext');
  CHANNEL_DEPOSIT_MAX = daicard.CHANNEL_DEPOSIT_MAX;
}

class CardContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    address: PropTypes.string,
    auth: PropTypes.object,
    isInitialized: PropTypes.bool,
    connextState: PropTypes.object,
    channelState: PropTypes.object,
    component: PropTypes.func
  };

  componentDidMount() {
    const mnemonic = localStorage.getItem('mnemonic');
    if (mnemonic) this.initConnext();
  }

  componentDidUpdate() {
    const { auth, address, actions } = this.props;
    if (address && auth.user && auth.user.walletAddress !== address) {
      actions.addWalletAddress(address);
    }
  }

  componentWillUnmount() {
    if (!this.connext) return;
    this.connext.stop();
  }

  initConnext = async (reinit = false) => {
    try {
      if (this.connext) this.connext.stop();
      this.connext = await daicard.initConnext({
        updateState: this.props.actions.updateConnextState,
        reinit
      });
      if (this.connext) this.connext.start();
    } catch (err) {
      // console.log(err);
    }
  };

  render() {
    const { isInitialized, channelState, connextState, component: Child } = this.props;
    const maxTokenDeposit = CHANNEL_DEPOSIT_MAX ? CHANNEL_DEPOSIT_MAX.toString() : '';
    const balance = isInitialized
      ? getChannelBalanceInUSD(channelState, connextState)
      : '$0.00';

    return (
      <Child
        {...this.props}
        connext={this.connext}
        initConnext={this.initConnext}
        maxTokenDeposit={maxTokenDeposit}
        balance={balance}
      />
    );
  }
}

const mapStateToProps = state => ({
  modal: state.navigation.modal,
  connextState: state.card.connextState,
  address: state.card.address,
  screenSize: state.navigation.screenSize,
  runtime: state.card.runtime,
  channelState: state.card.channelState,
  exchangeRate: state.card.exchangeRate,
  browserMinimumBalance: state.card.browserMinimumBalance,
  auth: state.auth,
  isInitialized: state.card.isInitialized
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...cardActions,
      ...navigationActions,
      addWalletAddress
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardContainer);
