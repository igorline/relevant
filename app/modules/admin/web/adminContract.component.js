import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BondingCurveContext } from 'bonded-token';
import { numbers } from 'app/utils';

export default class AdminContract extends Component {
  static propTypes = {
    RelevantCoin: PropTypes.object,
    user: PropTypes.object,
    wallet: PropTypes.object
  };

  // this context comes from the BondedTokenContainer
  static contextType = BondingCurveContext;

  state = {
    buyAmount: '',
    rewardsAmount: ''
  };

  async addRewards() {
    const { connectedAccount } = this.props.wallet;
    const amount = web3.utils.toWei(this.state.rewardsAmount.toString());
    this.props.RelevantCoin.methods.addRewards.cacheSend(amount, {
      from: connectedAccount
    });
  }

  async buyVirtual() {
    const { connectedAccount } = this.props.wallet;
    const amount = web3.utils.toWei(this.state.buyAmount.toString());
    this.props.RelevantCoin.methods.buyVirtualTokens.cacheSend({
      value: amount,
      from: connectedAccount
    });
  }

  onChange(e) {
    let { value } = e.target;
    value = value.length ? parseFloat(value) : '';
    if (e.target.max && value > e.target.max) {
      value = e.target.max;
    }
    this.setState({ [e.target.name]: value });
  }

  render() {
    const fixed = n => numbers.abbreviateNumber(n, 2);
    const { user } = this.props;
    if (!user) return null;

    const {
      tokenBalance,
      symbol,
      poolBalance,
      totalSupply,
      virtualSupply,
      virtualBalance,
      distributedRewards,
      rewardPool,
      walletBalance
    } = this.context.contractParams;

    return (
      <div className={'balances'}>
        <h3>Contract Params</h3>

        <div className="balanceList">
          <section>
            <div className={'row'}>
              <div>
                <h4>Pool Balance:</h4>
              </div>
              <span className="coin">{fixed(poolBalance)} ETH</span>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Total Supply:</h4>
              </div>
              <span className="coin">
                {fixed(totalSupply)} {symbol}
              </span>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Virtual Balance:</h4>
              </div>
              <span className="coin">{fixed(virtualBalance)} ETH</span>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Virtual Supply:</h4>
              </div>
              <span className="coin">
                {fixed(virtualSupply)} {symbol}
              </span>
            </div>

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
              <button className={'shadowButton'} onClick={this.buyVirtual.bind(this)}>
                Buy Virtual Tokens
              </button>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Reward Pool:</h4>
              </div>
              <span className="coin">
                {fixed(rewardPool)} {symbol}
              </span>
            </div>
          </section>

          <section>
            <div className={'row'}>
              <div>
                <h4>Distributed Rewards:</h4>
              </div>
              <span className="coin">
                {fixed(distributedRewards)} {symbol}
              </span>
            </div>

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
              <button className={'shadowButton'} onClick={this.addRewards.bind(this)}>
                Add Rewards
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
