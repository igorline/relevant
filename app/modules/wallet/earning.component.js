import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import { View, BodyText } from 'modules/styled/uni';
import ReactTooltip from 'react-tooltip';
import PostPreview from 'modules/post/postPreview.container';

export default class Earning extends Component {
  static propTypes = {
    earning: PropTypes.object,
    month: PropTypes.string,
    payout: PropTypes.number,
    mobile: PropTypes.bool
  };

  componentDidMount() {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }

  // componentDidUpdate(prevProps) {
  // if (prevProps.earnings.list.length !== this.props.earnings.list.length) {
  //   ReactTooltip.rebuild();
  // }
  // }

  render() {
    const { earning, month, payout, mobile } = this.props;
    const { community, post } = earning;
    if (!earning) return null;
    return (
      <View m={mobile ? '0 2' : '0 4'} key={earning._id}>
        {month ? (
          <View mt={4}>
            <BodyText>{month.toUpperCase()}</BodyText>
          </View>
        ) : (
          <View />
        )}
        <View
          border
          p={'1.5 2'}
          fdirection="row"
          mt={2}
          bg={colors.secondaryBG}
          grow={1}
          justify="space-between"
          data-for="tooltip"
          data-tip={JSON.stringify({
            type: 'EARNING',
            props: {
              earning
            }
          })}
        >
          <View display="flex" fdirection="row">
            <BodyText mr={4}>
              {earning.createdAt && numbers.getDayMonthYearTimestamp(earning.createdAt)}
            </BodyText>
            <BodyText c={colors.secondaryText}>{get(earning, 'status')}</BodyText>
          </View>
          {payout < 0 ? (
            <BodyText c={colors.red}>- {numbers.abbreviateNumber(payout)}RNT</BodyText>
          ) : (
            <BodyText c={colors.green}>+ {numbers.abbreviateNumber(payout)}RNT</BodyText>
          )}
        </View>

        {mobile ? <PostPreview mobile community={community} postId={post} /> : null}
      </View>
    );
  }
}
