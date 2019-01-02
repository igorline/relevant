import React, { Component } from 'react';
import PropTypes from 'prop-types';

const NETWORK = 4;

export default class MetaMaskCTA extends Component {
  static propTypes = {
    network: PropTypes.number,
    status: PropTypes.object,
    account: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll();
  }

  onScroll() {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  getMessage() {}

  renderBody() {
    let msg;
    const metamask = typeof web3 !== 'undefined';
    const network = this.props.network && NETWORK === this.props.network;

    const { account } = this.props;

    if (this.props.status !== 'initialized' || !this.props.network) return null;

    let button;

    if (!metamask) {
      return (
        <section className="body smaller">
          <p className="libre big">
            Did you know you can earn <span className="outline">Relevant Tokens</span> for curating
            quality content?
          </p>

          <p className="subH">
            Relevant Tokens live on the Ethereum blockchain
            <br />
            Download and install{' '}
            <a target="_blank" href="http://metamask.io">
              MetaMask
            </a>{' '}
            to get some.
            <br />
          </p>
        </section>
      );
    }

    if (!network) {
      button = null;
      msg = (
        <span>
          Relevant tokens are currently on the test network. Please connect MetaMask to the Rinkeby
          network.
        </span>
      );
    }

    if (!account) {
      msg = 'Log into into MetaMask to buy tokens and sync your account.';
      button = null;
    }

    if (msg) {
      return (
        <section className="body smaller">
          <p className="libre big">
            Did you know you can earn <span className="outline">Relevant Tokens</span> for curating
            quality content?
          </p>

          <p className="subH">
            {msg} {button}
          </p>
        </section>
      );
    }
    return null;
  }

  render() {
    const img = '/img/metamask.png';
    const body = this.renderBody();
    if (!body) return null;

    return (
      <div ref={c => (this.container = c)} className="splashContent metamask">
        <div className="mainSection">
          {body}
        </div>
        <div className="phone">
          <img onLoad={this.onScroll} ref={c => (this.phone = c)} src={img} alt="phone" />
        </div>
      </div>
    );
  }
}
