import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BondingCurveContext } from 'bonded-token';
import { numbers } from 'app/utils';

export default class Balance extends Component {
  static propTypes = {
    user: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object,
    wallet: PropTypes.object
  };

  // this context comes from the BondedTokenContainer
  static contextType = BondingCurveContext;

  async cashOut() {
    const { actions, user, contract } = this.props;
    try {
      const decimals = contract.methods.decimals.cacheCall();

      let cashOut = await actions.cashOut();
      cashOut = cashOut || user.cashOut;

      const { sig } = cashOut;
      let amount = new web3.utils.BN(cashOut.amount.toString());
      let mult = new web3.utils.BN(10 ** (decimals / 2));
      mult = mult.mul(mult);
      amount = amount.mul(mult);

      // let result = await this.props.RelevantCoin.methods.cashOut(amount, sig).call();
      // console.log(result);
      contract.methods.cashOut.cacheSend(amount, sig, {
        from: user.ethAddress[0]
      });
      // console.log(result);
    } catch (err) {
      throw err;
    }
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const { user, wallet } = this.props;
    if (!user) return null;
    let rewardBalance = user.balance;

    let { tokenBalance } = this.context.contractParams;
    const { symbol, priceDollar } = this.context.contractParams;
    const { connectedBalance, connectedAccount, nonce } = this.props.wallet;

    this.needSig = true;
    if (user.cashOut && nonce === user.cashOut.nonce) {
      this.needSig = false;
      if (rewardBalance === 0) rewardBalance = user.cashOut.amount;
    }

    // TODO cache value in backend
    tokenBalance = connectedBalance || user.tokenBalance || 0;
    const total = rewardBalance + tokenBalance;

    if (tokenBalance < 0.0000001) tokenBalance = 0;

    const usd = total * priceDollar;
    let accountWarning;

    const canCachOut =
      rewardBalance >= 100 || (user.cashOut && nonce === user.cashOut.nonce);

    if (wallet.differentAccount) {
      accountWarning = (
        <div className="warningRow">
          <span>
            Warning: Your connected account doesn't not match the current Metamask account
          </span>
          <Link to={'/user/wallet#connectAccount'}>
            <button className={'shadowButton'}>Connect Account</button>
          </Link>
        </div>
      );
    }

    if (!connectedAccount) {
      accountWarning = (
        <div className="warningRow">
          <span>Warning: your Metamask account is not connected to Relevant</span>
          <Link to={'/user/wallet#connectAccount'}>
            <button className={'shadowButton'}>Connect Account</button>
          </Link>
        </div>
      );
    }

    return (
      <div className={'balances'}>
        <h3>Balances</h3>

        <div className="balanceList">
          <section>
            <div className={'row'}>
              <div>
                <h4>Relevant Tokens:</h4>
                <p>
                  These are tokens held in your connected Ethereum account
                  <br />
                  {connectedAccount}
                </p>
              </div>
              <span className="coin">
                {fixed(tokenBalance)} {symbol}
              </span>
            </div>
            {accountWarning ? <div className="warning">{accountWarning}</div> : null}
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Reward Tokens:</h4>
                <p>
                  These are tokens you earned as rewards.
                  <br />
                  Once you have more than 100, you can transfer them to your Ethereum
                  account.
                </p>
              </div>
              <span className="coin">
                {fixed(rewardBalance)} {symbol}
              </span>
            </div>
            <div className="transferTokens">
              <button
                disabled={!canCachOut}
                className={'shadowButton'}
                onClick={this.cashOut.bind(this)}
              >
                Cash Out
              </button>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Total:</h4>
                <p>
                  This is your total amount of tokens.
                  <br />
                  You can use these tokens to stake on your votes.
                  <br />
                  The more you stake the more you can earn).
                </p>
              </div>
              <span className="coin">
                {fixed(total)} {symbol}
              </span>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Estimated Account Value:</h4>
                <p>This is the estimated account value denominated in USD.</p>
              </div>
              <span>$ {fixed(usd)} USD</span>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
