import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { numbers } from '../../../utils';

export default class Balance extends Component {
  // this context comes from the BondedTokenContainer
  static contextTypes = {
    contractParams: PropTypes.object,
  }

  async cashOut() {
    try {
      let user = this.props.user;
      let decimals = this.props.RelevantCoin.methods.decimals.cacheCall();

      let cashOut = await this.props.actions.cashOut();
      cashOut = cashOut || user.cashOut;

      let sig = cashOut.sig;
      let amount = new web3.utils.BN(cashOut.amount.toString());
      let mult = new web3.utils.BN(10 ** (decimals / 2));
      mult = mult.mul(mult);
      amount = amount.mul(mult);
      console.log('amount ', amount.toString());

      // let result = await this.props.RelevantCoin.methods.cashOut(amount, sig).call();
      // console.log(result);
      this.props.RelevantCoin.methods.cashOut.cacheSend(amount, sig, {
        from: user.ethAddress[0]
      });
      // console.log(result);
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const user = this.props.user;
    if (!user) return null;
    let rewardBalance = this.props.user.balance;

    let { tokenBalance, symbol, priceDollar } = this.context.contractParams;
    let { connectedBalance, connectedAccount, nonce } = this.props.wallet;

    this.needSig = true;
    if (user.cashOut && nonce === user.cashOut.nonce) {
      this.needSig = false;
      if (rewardBalance === 0) rewardBalance = user.cashOut.amount;
    }

    // TODO cache value in backend
    tokenBalance = user.tokenBalance || connectedBalance || 0;
    let total = rewardBalance + tokenBalance;

    let usd = total * priceDollar;
    let accountWarning;

    let canCachOut = rewardBalance >= 100 || (user.cashOut && nonce === user.cashOut.nonce);

    if (this.props.wallet.differentAccount) {
      accountWarning = (<div className='warningRow'>
        <span>
        Warning: Your connected account doesn't not match the current Metamask account
        </span>
        <Link
          to={'/wallet#connectAccount'}
        >
          <button className={'basicButton smallButton'}>
            Connect Account
          </button>
        </Link>
      </div>);
    }

    if (!connectedAccount) {
      accountWarning = <div className='warningRow'>
        <span>Warning: your Metamask account is not connected to Relevant</span>
        <Link
          to={'/wallet#connectAccount'}
        >
          <button className={'basicButton smallButton'}>
            Connect Account
          </button>
        </Link>
      </div>;
    }

    return (
      <div className={'balances'}>
        <h3>Balances</h3>

        <div className="balanceList">
          <section>
            <row>
              <div>
                <h4>Relevant Tokens:</h4>
                <p>
                  These are tokens held in your connected Ethereum account
                  <br />{connectedAccount}
                </p>
              </div>
              <span className="coin">{fixed(tokenBalance)} {symbol}</span>
            </row>
            {accountWarning ? <div className="warning">
              {accountWarning}
            </div> : null}
          </section>

          <section>
            <row>
              <div>
                <h4>Reward Tokens:</h4>
                <p>
                  These are tokens you earned as rewards.<br />
                  Once you have more than 100, you can transfer them to your Ethereum account.
                </p>
              </div>
              <span className="coin">{fixed(rewardBalance)} {symbol}</span>
            </row>
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
            <row>
              <div>
                <h4>Total:</h4>
                <p>
                  This is your total amount of tokens.<br />
                  You can use these tokens to stake on your votes.<br />
                  The more you stake the more you can earn).
                </p>
              </div>
              <span className="coin">{fixed(total) } {symbol}</span>
            </row>
          </section>

          <section>
            <row>
              <div>
                <h4>Estimated Account Value:</h4>
                <p>
                  This is the estimated account value denominated in USD.
                </p>
              </div>
              <span>$ {fixed(usd)} USD</span>
            </row>
          </section>
        </div>
      </div>
    );
  }
}
