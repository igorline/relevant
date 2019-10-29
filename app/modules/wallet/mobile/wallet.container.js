import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import * as authActions from 'modules/auth/auth.actions';
import * as earningsActions from 'modules/wallet/earnings.actions';
import Earning from 'modules/wallet/earning.component';
import BalanceComponent from 'modules/wallet/balance.component';
import { View } from 'modules/styled/uni';
import get from 'lodash/get';
import CustomListView from 'modules/listview/mobile/customList.component';
import { computeUserPayout } from 'app/utils/rewards';
import PostPreview from 'modules/post/postPreview.container';
import { withNavigation } from 'react-navigation';
import { getMonth } from 'app/utils/numbers';

const PAGE_SIZE = 30;

class WalletContainer extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    contract: PropTypes.object,
    actions: PropTypes.object,
    earnings: PropTypes.object,
    reload: PropTypes.number,
    refresh: PropTypes.number,
    screenSize: PropTypes.number
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
    if (!this.props.earnings.list.length) {
      this.load(0, 0);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.refresh !== prevProps.refresh) {
      this.scrollToTop();
    }

    if (this.props.reload !== prevProps.reload) {
      this.needsReload = new Date().getTime();
    }
    if (!this.props.earnings.list.length) this.reload();
  }

  scrollToTop = () => {
    const view = this.listview;
    if (view && view.listview) {
      view.listview.scrollToOffset({ offset: 0 });
    }
  };

  load = async (view, length) => {
    if (this.loading) return null;
    this.loading = true;
    await this.props.actions.getEarnings(null, PAGE_SIZE, length);
    this.loading = false;
    return null;
  };

  reload = () => this.load(0, 0);

  renderHeader = () => (
    <View>
      <BalanceComponent {...this.props} />
    </View>
  );

  createListItem = (item, i) => {
    if (parseInt(i, 10) === 0) this.previousMonth = null;
    if (!item) return null;
    const earning = item;

    const payout = computeUserPayout(earning);

    const month = getMonth(earning.createdAt);
    const showMonth = month !== this.previousMonth;
    this.previousMonth = month;
    return {
      earning,
      payout,
      month: showMonth ? month : null
    };
  };

  renderRow = item => {
    const { screenSize } = this.props;
    const { earning, payout, month } = item;
    return (
      <Earning
        screenSize={screenSize}
        earning={earning}
        payout={payout}
        month={month}
        PostPreview={PostPreview}
      />
    );
  };

  render() {
    const { contract, earnings } = this.props;
    if (contract && !contract.initialized) return null;

    const { list } = earnings;
    const entities = list
      .map((id, i) => this.createListItem(earnings.entities[id], i))
      .filter(el => el !== null);

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
          active
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          load={this.load}
          type={'posts'}
          parent={'feed'}
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
    reload: state.navigation.wallet.reload,
    screenSize: state.navigation.screenSize
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
