import React, {
  Component,
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Wallet from './wallet.component';
import * as authActions from '../../../actions/auth.actions';
import Eth from '../ethTools/eth.context';
import Balance from './balance.component';
import Footer from '../common/footer.component';
import MetaMaskCta from '../splash/metaMaskCta.component';
import { BondedTokenContainer, BondedTokenTransact } from 'bonded-token';

if (process.env.BROWSER === true) {
  require('./wallet.css');
}

class WalletContainer extends Component {
  renderHeader() {
    if (this.props.user && this.props.user.ethAddress[0]) return null;
    return (
      <Eth.Consumer>
        {wallet => (<MetaMaskCta { ...wallet } />)}
      </Eth.Consumer>
    );
  }

  render() {
    return (
      <div style={{ flex: 1 }}>
        <div className={'banner'}>
          {this.renderHeader()}
        </div>
        <BondedTokenContainer {...this.props} >
          <div className={'row pageContainer column'}>
            <Eth.Consumer>
              {wallet => <Balance wallet={wallet} { ...this.props } />}
            </Eth.Consumer>
            <Wallet user={this.props.user} />
          </div>
        </BondedTokenContainer>
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
    drizzleStatus: state.drizzleStatus,
    contract: state.contracts.RelevantCoin,
    accounts: state.accounts,
    contracts: state.contracts,
    accountBalances: state.accountBalances,
    drizzle: {
      transactions: state.transactions,
      web3: state.web3,
      transactionStack: state.transactionStack,
    }
  };
}


const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...authActions,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(WalletContainer);
