import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import * as authActions from 'modules/auth/auth.actions';
import * as earningsActions from 'modules/wallet/earnings.actions';
import Eth from 'modules/web_ethTools/eth.context';
// import MetaMaskCta from 'modules/web_splash/metaMaskCta.component';
import Earning from 'modules/wallet/earning.component';
import { initDrizzle } from 'app/utils/eth';
import Balance from 'modules/wallet/balance.component';
import { View } from 'modules/styled/uni';
import get from 'lodash/get';
import CustomListView from 'modules/listview/mobile/customList.component';
import moment from 'moment';
import { computeUserPayout } from 'app/utils/rewards';
import PostPreview from 'modules/post/postPreview.container';
import { withNavigation } from 'react-navigation';

let drizzle;

const PAGE_SIZE = 30;

class WalletContainer extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object,
    earnings: PropTypes.object,
    reload: PropTypes.number,
    refresh: PropTypes.number
  };

  static contextTypes = {
    store: PropTypes.object
  };

  state = {
    reloading: false
  };

  needsReload = new Date().getTime();

  shouldComponentUpdate(next) {
    return next.navigation.isFocused();
  }

  componentDidMount() {
    const { isAuthenticated } = this.props.auth;
    if (isAuthenticated) {
      // eslint-disable-next-line
      drizzle = initDrizzle(this.context.store);
    }
    if (!this.props.earnings.list.length) {
      this.load(0, 0);
    }
  }

  componentDidUpdate(prevProps) {
    const { isAuthenticated } = this.props.auth;
    if (isAuthenticated && !prevProps.auth.isAuthenticated && !drizzle) {
      drizzle = initDrizzle(this.context.store);
    }

    if (this.props.refresh !== prevProps.refresh) {
      this.scrollToTop();
    }

    if (this.props.reload !== prevProps.reload) {
      this.needsReload = new Date().getTime();
    }
  }

  scrollToTop = () => {
    const view = this.listview;
    if (view && view.listview) {
      view.listview.scrollTo({ y: 0, animated: true });
    }
  };

  load = (view, length) => {
    this.props.actions.getEarnings(null, PAGE_SIZE, length);
  };

  reload = () => this.load(0, 0);

  renderHeader = () => (
    // eslint-disable-line
    // if (this.props.user && this.props.user.ethAddress && this.props.user.ethAddress[0]) {
    //   return null;
    // }
    // return <Eth.Consumer>{wallet => <MetaMaskCta {...wallet} />}</Eth.Consumer>;

    <View>
      <Eth.Consumer>
        {wallet => <Balance wallet={wallet} mobile {...this.props} />}
      </Eth.Consumer>
    </View>
  );

  renderRow = item => {
    if (!item) return null;
    const earning = item;

    const payout = computeUserPayout(earning);
    if (!payout || !earning) return null;

    const month = moment(earning.createdAt).format('MMMM');
    const showMonth = this.previousMonth !== month;
    this.previousMonth = month;

    return (
      <Earning
        mobile
        earning={earning}
        payout={payout}
        month={showMonth ? month : null}
        PostPreview={PostPreview}
      />
    );
  };

  render() {
    const { contract, earnings } = this.props;
    if (contract && !contract.initialized) return null;

    const { list } = earnings;
    const entities = list.map(id => earnings.entities[id]);
    this.previousMonth = null;

    return (
      <View flex={1}>
        <CustomListView
          ref={c => {
            this.listview = c;
          }}
          // key={tab.id}
          view={0}
          data={entities}
          loaded
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          load={this.load}
          type={'posts'}
          parent={'feed'}
          active
          needsReload={this.needsReload}
          actions={this.props.actions}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    earnings: state.earnings,
    user: state.auth.user,
    drizzleStatus: state.drizzleStatus,
    contract: get(state, 'contracts.RelevantCoin'),
    accounts: state.accounts,
    contracts: state.contracts,
    accountBalances: state.accountBalances,
    drizzle: {
      transactions: state.transactions,
      web3: state.web3,
      transactionStack: state.transactionStack
    },
    refresh: state.navigation.wallet.refresh,
    reload: state.navigation.wallet.reload
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...earningsActions
    },
    dispatch
  )
});

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WalletContainer)
);
