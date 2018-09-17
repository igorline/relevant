import React, {
  Component,
} from 'react';
import { BondedTokenUtils } from 'bonded-token';

const NETWORK = 4;

export default class MetaMaskCTA extends Component {
  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll();
  }

  onScroll(e) {
    if (!this.phone) return;
    this.phone.style.transform = '';
    let top = this.phone.getBoundingClientRect().top - 169;
    let y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  getMessage() {

  }

  renderBody() {
    let metamask = typeof web3 !== 'undefined';
    let network = this.props.network && NETWORK === this.props.network;
    let { account, balance } = this.props;
    let body;
    let msg;

    if (this.props.status !== 'initialized' || !this.props.network) return null;

    let button;

    if (!metamask) {
      return body = (
        <section className="body smaller">
          <p className="libre big">
            Did you know you can earn <span className="outline">Relevant Tokens</span> for curating quality content?
          </p>

          <p className="subH">
            Relevant Tokens live on the Ethereum blockchain<br />
            Download and install <a target="_blank" href='http://metamask.io'>MetaMask</a> to get some.
            <br />
          </p>
{/*          <p className="subH note">
            *Tokens are currently on the testnet and have no monetary value
          </p>*/}
        </section>
      );
    }

    // if (account && !balance) {
    //   msg = 'Launch your wallet to buy Relevant Tokens.';
    //   button = (
    //     <button onClick={this.props.toggleWallet} className="shadowButton">
    //     Open Wallet</button>);
    // }

    if (!network) {
      button = null;
      msg = (<span>
        Relevant tokens are currently on the test network. Please connect MetaMask to the Rinkeby network.
      </span>);
    }

    if (!account) {
      msg = 'Log into into MetaMask to buy tokens and sync your account.';
      button = null;
    }

    if (msg) {
      return body = (
        <section className="body smaller">
          <p className="libre big">
            Did you know you can earn <span className="outline">Relevant Tokens</span> for curating quality content?
          </p>

          <p className="subH">
            {msg}          {button}

          </p>
{/*          <p className="subH note">
            *Tokens are currently on the test network and have no monetary value
          </p>*/}
        </section>
      );
    }
  }

  render() {
    let img = "/img/metamask.png";
    let body = this.renderBody();
    if (!body) return null;

    return (
      <div ref={c => this.container = c} className="splashContent metamask">
        <mainSection>
          {body}
        </mainSection>
        <div className="phone">
          <img onLoad={this.onScroll} ref={c => this.phone = c} src={img} alt="phone" />
        </div>
      </div>
    );
  }
}
