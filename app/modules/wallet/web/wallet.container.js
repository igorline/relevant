import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import * as authActions from 'modules/auth/auth.actions';
import * as earningsActions from 'modules/wallet/earnings.actions';
import Earning from 'modules/wallet/earning.component';
import BalanceComponent from 'modules/wallet/balance.component';
import { View } from 'modules/styled/uni';
import InfScroll from 'modules/listview/web/infScroll.component';
import { computeUserPayout } from 'app/utils/rewards';
import PostPreview from 'modules/post/postPreview.container';
import { getMonth } from 'app/utils/numbers';

const PAGE_SIZE = 50;

class WalletContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    earnings: PropTypes.object,
    screenSize: PropTypes.number
  };

  state = {
    reloading: false
  };

  hasMore = true;

  load = (page, length) => {
    this.hasMore = page * PAGE_SIZE <= length;
    if (this.hasMore) {
      this.props.actions.getEarnings(null, PAGE_SIZE, length);
    }
  };

  reload = () => this.load(0, 0);

  renderHeader = () => (
    <View>
      <BalanceComponent isWeb />
    </View>
  );

  renderRow = ({ item }) => {
    const { screenSize } = this.props;
    if (!item) return null;
    const earning = item;

    const payout = computeUserPayout(earning);
    // if (!payout) return null;

    const month = getMonth(earning.createdAt);
    const showMonth = this.previousMonth !== month;
    this.previousMonth = month;

    return (
      <Earning
        key={earning._id}
        earning={earning}
        payout={payout}
        month={showMonth ? month : null}
        PostPreview={PostPreview}
        screenSize={screenSize}
      />
    );
  };

  render() {
    const { earnings } = this.props;
    const { list } = earnings;
    const entities = list.map(id => earnings.entities[id]);
    this.previousMonth = null;

    return (
      <View mb={8}>
        {this.renderHeader()}
        <View>
          <InfScroll
            data={list}
            loadMore={p => this.load(p, list.length)}
            hasMore={this.hasMore}
            key="recent-activity"
            className={'parent'}
            style={{ position: 'relative', marginBottom: 20 }}
          >
            {entities.map(item => this.renderRow({ item }))}
          </InfScroll>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    earnings: state.earnings,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer);
