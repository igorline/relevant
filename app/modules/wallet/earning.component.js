import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import { View, BodyText } from 'modules/styled/uni';
import { elementTypePropTypeChecker } from 'utils/propValidation';

export default class Earning extends Component {
  static propTypes = {
    earning: PropTypes.object,
    month: PropTypes.string,
    payout: PropTypes.number,
    screenSize: PropTypes.number,
    PostPreview: elementTypePropTypeChecker
  };

  render() {
    const { earning, month, payout, screenSize, PostPreview } = this.props;
    const { community, post } = earning;
    if (!earning) return null;
    return (
      <View m={['0 4', '0 2']} key={earning._id}>
        {month ? (
          <View mt={4}>
            <BodyText>{month.toUpperCase()}</BodyText>
          </View>
        ) : (
          <View />
        )}
        <View
          bt
          bl
          br
          bb={!post}
          p={'1.5 2'}
          fdirection="row"
          mt={2}
          bg={colors.secondaryBG}
          grow={1}
          justify="space-between"
        >
          <View display="flex" fdirection="row">
            <BodyText mr={4}>
              {earning.createdAt && numbers.getDayMonthYearTimestamp(earning.createdAt)}
            </BodyText>
            <BodyText c={colors.secondaryText}>{get(earning, 'status')}</BodyText>
          </View>
          {payout < 0 ? (
            <BodyText c={colors.red}>- {numbers.abbreviateNumber(payout)} REL</BodyText>
          ) : (
            <BodyText c={colors.green}>+ {numbers.abbreviateNumber(payout)} REL</BodyText>
          )}
        </View>
        {post ? (
          <View border={screenSize ? null : 1}>
            <PostPreview screenSize={screenSize} community={community} postId={post} />
          </View>
        ) : null}
      </View>
    );
  }
}
