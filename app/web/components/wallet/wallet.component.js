import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import {
  BondedTokenHeader,
  BondedTokenTransact,
  BondedTokenBalance
} from 'bonded-token';
import ShadowButton from '../common/ShadowButton';

if (process.env.BROWSER === true) {
  require('bonded-token/src/css/BondedToken.css');
  require('./wallet.css');
}

export default class Wallet extends Component {
  componentDidMount() {
    this.okToRender = true;
  }

  render() {
    if (!this.okToRender && !this.props.okToRender) return null;
    if (!this.props.user) return null;
    return (
      <div className="walletContainer">
        <span className='balanceImage' ><img src='/img/r.png' /></span>
        <BondedTokenBalance />
        <BondedTokenHeader
          title={'Relevant Wallet'}
          accentColor={'#3E3EFF'}
        />
        <BondedTokenTransact
          accentColor={'#3E3EFF'}
          network={'Rinkeby'}
        >
          <div>
            <ShadowButton
              style={{ margin: '10px 0 10px 0', width: '100%' }}
            >
              Submit
            </ShadowButton>
          </div>
        </BondedTokenTransact>
        <div className="smallText">
          <p>
            Relevant Tokens are currently on the test network and have no monetary value.
            <br />
          </p>
          <p>
            You can get some free test Ether here: <a target="_blank" href='https://faucet.rinkeby.io' >https://faucet.rinkeby.io</a>
            <br />
            (pro-tip: use your GooglePlus account)
          </p>
        </div>
      </div>
    );
  }
}
