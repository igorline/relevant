import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CTALink, Title } from 'modules/styled/uni';
import Modal from 'modules/ui/web/modal';
import * as Connext from 'connext';

const { Currency, CurrencyType, CurrencyConvertable } = Connext.types;
const { getExchangeRates } = new Connext.Utils();

export default class WithdrawModal extends Component {
  static propTypes = {
    modal: PropTypes.string,
    actions: PropTypes.object,
    connextState: PropTypes.object,
    maxTokenDeposit: PropTypes.string,
    browserMinimumBalance: PropTypes.object,
    address: PropTypes.string
  };

  state = {};

  getMaxMinAmounts = () => {
    const { connextState, browserMinimumBalance, maxTokenDeposit } = this.props;
    let minEth;
    // minDai
    let maxDai;
    let maxEth;

    if (connextState && connextState.runtime && browserMinimumBalance) {
      const minConvertable = new CurrencyConvertable(
        CurrencyType.WEI,
        browserMinimumBalance.wei,
        () => getExchangeRates(connextState)
      );

      const maxConvertable = new CurrencyConvertable(
        CurrencyType.BEI,
        maxTokenDeposit,
        () => getExchangeRates(connextState)
      );
      minEth = minConvertable.toETH().amountBigNumber.toFixed();
      // minDai = Currency.USD(browserMinimumBalance.dai).format({})
      maxEth = maxConvertable.toETH().amountBigNumber.toFixed();
      maxDai = Currency.USD(maxConvertable.toUSD().amountBigNumber).format({});
    }
    return { minEth, maxDai, maxEth };
  };

  render() {
    const { modal, actions, address } = this.props;
    const { minEth, maxDai, maxEth } = this.getMaxMinAmounts();

    return (
      <Modal
        visible={modal === 'depositModal'}
        close={actions.hideModal}
        title={'Deposit ETH or DAI'}
      >
        <CTALink>Send a minimum of: {minEth || ''} ETH to this address:</CTALink>
        <Title mt={2}>{address}</Title>
        <CTALink mt={1}>
          Deposits over {maxEth ? maxEth.substring(0, 4) : ''} Eth or{' '}
          {maxDai ? maxDai.substring(1, 3) : ''} Dai will be refunded
        </CTALink>
      </Modal>
    );
  }
}
