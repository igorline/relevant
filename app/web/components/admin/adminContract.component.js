import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { numbers } from '../../../utils';

export default class AdminContract extends Component {
  // this context comes from the BondedTokenContainer
  static contextTypes = {
    contractParams: PropTypes.object,
    accountInfo: PropTypes.object,
  }

  state = {
    buyAmount: '',
    rewardsAmount: '',
  }

  async addRewards() {
    let { connectedAccount } = this.props.wallet;
    let amount = web3.utils.toWei(this.state.rewardsAmount.toString());
    this.props.RelevantCoin.methods.addRewards.cacheSend(amount, { from: connectedAccount });
  }

  async buyVirtual() {
    let { connectedAccount } = this.props.wallet;
    let amount = web3.utils.toWei(this.state.buyAmount.toString());
    this.props.RelevantCoin.methods.buyVirtualTokens.cacheSend({ value: amount, from: connectedAccount });
  }

  onChange(e) {
    let value = e.target.value;
    value = value.length ? parseFloat(value) : '';
    if (value > e.target.max) {
      value = e.target.max;
    }
    this.setState({ [e.target.name]: value });
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const user = this.props.user;
    if (!user) return null;

    let {
      tokenBalance,
      symbol,
      priceDollar,
      poolBalance,
      totalSupply,
      inflationSupply,
      virtualSupply,
      virtualBalance,
      distributedRewards,
      rewardPool
    } = this.context.contractParams;

    let { walletBalance } = this.context.accountInfo;

    let { connectedBalance, connectedAccount, nonce } = this.props.wallet;

    return (
      <div className={'balances'}>
        <h3>Contract Params</h3>

        <div className="balanceList">
          <section>
            <row>
              <div>
                <h4>Pool Balance:</h4>
              </div>
              <span className="coin">{fixed(poolBalance)} ETH</span>
            </row>
          </section>

          <section>
            <row>
              <div>
                <h4>Total Supply:</h4>
              </div>
              <span className="coin">{fixed(totalSupply)} {symbol}</span>
            </row>
          </section>

          <section>
            <row>
              <div>
                <h4>Virtual Balance:</h4>
              </div>
              <span className="coin">{fixed(virtualBalance)} ETH</span>
            </row>
          </section>

          <section>
            <row>
              <div>
                <h4>Virtual Supply:</h4>
              </div>
              <span className="coin">{fixed(virtualSupply)} {symbol}</span>
            </row>

            <div className="transferTokens">
              <input
                className="blueInput"
                type="text"
                name="buyAmount"
                value={this.state.buyAmount}
                onChange={this.onChange.bind(this)}
                max={walletBalance}
                min={0}
              />
              <button
                className={'shadowButton'}
                onClick={this.buyVirtual.bind(this)}
              >
                Buy Virtual Tokens
              </button>
            </div>

          </section>

          <section>
            <row>
              <div>
                <h4>Reward Pool:</h4>
              </div>
              <span className="coin">{fixed(rewardPool)} {symbol}</span>
            </row>
          </section>

          <section>
            <row>
              <div>
                <h4>Distributed Rewards:</h4>
              </div>
              <span className="coin">{fixed(distributedRewards)} {symbol}</span>
            </row>

            <div className="transferTokens">
              <input
                className="blueInput"
                type="text"
                name="rewardsAmount"
                value={this.state.rewardsAmount}
                onChange={this.onChange.bind(this)}
                max={tokenBalance}
                min={0}
              />
              <button
                className={'shadowButton'}
                onClick={this.addRewards.bind(this)}
              >
                Add Rewards
              </button>
            </div>

          </section>

        </div>
      </div>
    );
  }
}
