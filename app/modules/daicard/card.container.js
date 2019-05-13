import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Connext from 'connext';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { getChannelBalanceInUSD } from './connext/currencyFormatting';
import Withdraw from './withdraw.component';
import Deposit from './deposit.component';
import CardBalance from './cardBalance.component';
import * as cardActions from './card.actions';

const { hasPendingOps } = new Connext.Utils();

let daicard;
let CHANNEL_DEPOSIT_MAX;
if (process.env.BROWSER === true) {
  daicard = require('./connext');
  CHANNEL_DEPOSIT_MAX = daicard.CHANNEL_DEPOSIT_MAX;
}

const RPC = 'RINKEBY';
// const RPC = 'MAINNET';

class DaiCard extends Component {
  static propTypes = {
    actions: PropTypes.object,
    connextState: PropTypes.object,
    channelState: PropTypes.object,
    modal: PropTypes.string
  };

  state = {
    initialized: false
  };

  async componentDidMount() {
    this.connext = await daicard.initConnext({
      rpc: RPC,
      updateState: this.props.actions.updateConnextState
    });

    // start polling
    if (this.connext) this.connext.start();
    this.setState({ initialized: true });
  }

  componentWillUnmount() {
    if (!this.connext) return;
    this.connext.stop();
  }

  render() {
    const { initialized } = this.state;
    const { connextState, channelState, modal } = this.props;
    const balance = initialized
      ? getChannelBalanceInUSD(channelState, connextState)
      : '$0.00';

    return (
      <React.Fragment>
        <CardBalance {...this.props} balance={balance} />
        {initialized && modal === 'withdrawModal' && (
          <Withdraw
            {...this.props}
            balance={balance}
            hasPendingOps={hasPendingOps}
            connext={this.connext}
          />
        )}
        {initialized && modal === 'depositModal' && (
          <Deposit {...this.props} maxTokenDeposit={CHANNEL_DEPOSIT_MAX.toString()} />
        )}
      </React.Fragment>
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
  browserMinimumBalance: state.card.browserMinimumBalance
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...cardActions,
      ...navigationActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DaiCard);
