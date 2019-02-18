import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import moment from 'moment';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import { View, BodyText } from 'modules/styled/uni';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as earningsActions from 'modules/wallet/earnings.actions';
import InfScroll from 'modules/listview/web/infScroll.component';
import ReactTooltip from 'react-tooltip';

export class Earnings extends Component {
  static propTypes = {
    earnings: PropTypes.object
  };

  componentDidUpdate(prevProps) {
    if (prevProps.earnings.list.length !== this.props.earnings.list.length) {
      ReactTooltip.rebuild();
    }
  }

  hasMore = true;

  load = (page, length) => {
    this.hasMore = page * this.props.pageSize <= length;
    if (this.hasMore) {
      this.props.actions.getEarnings(null, this.props.pageSize, length);
    }
  };

  renderPayout(earning) {
    if (earning.status === 'pending') {
      return (
        (earning.estimatedPostPayout * earning.stakedTokens) / earning.totalPostShares
      );
    }
    if (earning.status === 'paidout') {
      return earning.earned;
    }
    return 0;
  }

  render() {
    const { list, entities } = this.props.earnings;
    let previousMonth = null;
    return (
      <InfScroll
        data={list}
        loadMore={p => this.load(p, list.length)}
        hasMore={this.hasMore}
        key="recent-activties"
        className={'parent'}
        style={{ position: 'relative' }}
      >
        <View mt={4}>
          {list.map(id => {
            const earning = entities[id];
            if (!earning) {
              return null;
            }
            const payout = this.renderPayout(earning);
            const formattedPayout = numbers.abbreviateNumber(payout);
            if (!payout) {
              return null;
            }
            const earningMonth = moment(earning.createdAt).format('MMMM');
            let showMonth = false;
            if (previousMonth !== earningMonth) {
              showMonth = true;
              previousMonth = earningMonth;
            }
            return (
              <View key={earning._id}>
                {showMonth ? (
                  <BodyText mt={4}>{earningMonth.toUpperCase()}</BodyText>
                ) : null}
                <View
                  border
                  p={1.5}
                  fdirection="row"
                  mt={2}
                  bg={colors.secondaryBG}
                  grow={1}
                  justify="space-between"
                  data-for="tooltip"
                  data-tip={JSON.stringify({
                    type: 'EARNING',
                    props: {
                      text: 'Claim your tokens!',
                      earning
                    }
                  })}
                >
                  <View display="flex" fdirection="row">
                    <BodyText mr={4}>
                      {earning.createdAt &&
                        numbers.getDayMonthYearTimestamp(earning.createdAt)}
                    </BodyText>
                    <BodyText c={colors.secondaryText}>{get(earning, 'status')}</BodyText>
                  </View>
                  {formattedPayout < 0 ? (
                    <BodyText c={colors.red}>- {formattedPayout}RNT</BodyText>
                  ) : (
                    <BodyText c={colors.green}>+ {formattedPayout}RNT</BodyText>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </InfScroll>
    );
  }
}

Earnings.propTypes = {
  actions: PropTypes.object,
  pageSize: PropTypes.number
};

function mapStateToProps(state) {
  return {
    earnings: state.earnings
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      // ...authActions,
      ...earningsActions
    },
    dispatch
  )
});

const EarningsComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Earnings);

export default EarningsComponent;
