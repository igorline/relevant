import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SecondaryText, CTALink, Button } from 'modules/styled/uni';
import Web3 from 'web3';
import * as Connext from 'connext';
import { Input } from 'modules/styled/web';
import Modal from 'modules/ui/web/modal';

const { hasPendingOps } = new Connext.Utils();

export default class WithdrawModal extends Component {
  static propTypes = {
    modal: PropTypes.string,
    actions: PropTypes.object,
    balance: PropTypes.string,
    connextState: PropTypes.object,
    channelState: PropTypes.object,
    connext: PropTypes.object,
    runtime: PropTypes.object,
    exchangeRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isInitialized: PropTypes.bool
  };

  state = {
    withdrawalVal: {
      withdrawalWeiUser: '0',
      tokensToSell: '0',
      withdrawalTokenUser: '0',
      weiToSell: '0',
      recipient: ''
    },
    addressError: null,
    balanceError: null,
    withdrawEth: true,
    withdrawing: false
  };

  componentDidUpdate() {
    const { runtime, actions } = this.props;
    const { withdrawing } = this.state;
    if (withdrawing && !runtime.awaitingOnchainTransaction) {
      this.setState({ withdrawing: false });
      actions.hideModal();
    }
  }

  async updateWithdrawalVals(withdrawEth) {
    this.setState({ withdrawEth });

    // set the state to contain the proper withdrawal args for
    // eth or dai withdrawal
    const { channelState, exchangeRate } = this.props;
    let { withdrawalVal } = this.state;
    if (withdrawEth) {
      // withdraw all channel balance in eth
      withdrawalVal = {
        ...withdrawalVal,
        exchangeRate,
        tokensToSell: channelState.balanceTokenUser,
        withdrawalWeiUser: channelState.balanceWeiUser,
        weiToSell: '0',
        withdrawalTokenUser: '0'
      };
    } else {
      // handle withdrawing all channel balance in dai
      withdrawalVal = {
        ...withdrawalVal,
        exchangeRate,
        tokensToSell: '0',
        withdrawalWeiUser: '0',
        weiToSell: channelState.balanceWeiUser,
        withdrawalTokenUser: channelState.balanceTokenUser
      };
    }

    this.setState({ withdrawalVal });
    return withdrawalVal;
  }

  withdrawalHandler = async withdrawEth => {
    try {
      const { connext } = this.props;

      const withdrawalVal = await this.updateWithdrawalVals(withdrawEth);

      this.setState({ addressError: null, balanceError: null });

      if (!Web3.utils.isAddress(withdrawalVal.recipient)) {
        const addressError = `${
          withdrawalVal.recipient === ''
            ? 'Must provide address.'
            : withdrawalVal.recipient + ' is an invalid address'
        }`;
        this.setState({ addressError });
        return;
      }
      // check the input balance is under channel balance
      // TODO: allow partial withdrawals?
      // invoke withdraw modal

      // console.log(`Withdrawing: ${JSON.stringify(withdrawalVal, null, 2)}`);
      await connext.withdraw(withdrawalVal);
      this.setState({ withdrawing: true });
    } catch (err) {
      // console.log(err);
    }
  };

  render() {
    const {
      modal,
      actions,
      balance,
      channelState,
      connextState,
      isInitialized
    } = this.props;
    if (!isInitialized || modal !== 'withdrawModal') return null;

    const { addressError, balanceError, withdrawalVal } = this.state;

    return (
      <Modal visible close={actions.hideModal} title={'Withdraw ' + balance}>
        <CTALink>Enter an Ethereum address you would like to send funds to</CTALink>
        <Input
          value={withdrawalVal.recipient}
          onChange={e =>
            this.setState({
              withdrawalVal: {
                ...withdrawalVal,
                recipient: e.target.value
              }
            })
          }
          mt={2}
          placeholder="Address"
        />
        {addressError && (
          <SecondaryText mt={1} c={'red'}>
            {addressError}
          </SecondaryText>
        )}
        {balanceError && (
          <SecondaryText mt={1} c={'red'}>
            {balanceError}
          </SecondaryText>
        )}
        <Button
          onClick={() => this.withdrawalHandler(true)}
          disabled={!connextState || hasPendingOps(channelState)}
          mr={'auto'}
          mt={4}
        >
          Cash Out
        </Button>
      </Modal>
    );
  }
}
