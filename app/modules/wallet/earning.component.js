import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import { View, BodyText } from 'modules/styled/uni';
import { elementTypePropTypeChecker } from 'utils/propValidation';
import { getTimestamp } from 'utils/numbers';

export default class Earning extends PureComponent {
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

    const { status = '' } = earning;
    const payoutTime = status === 'pending' && getTimestamp(earning.payoutTime);

    const text = earning.cashOutAttempt
      ? `Transfer tokens to Ethereum wallet: ${status}`
      : `${status}${payoutTime ? ' ' + payoutTime.toLowerCase() : ''}`;

    const monthEl = month && (
      <View mt={4}>
        <BodyText>{month.toUpperCase()}</BodyText>
      </View>
    );

    return (
      <View m={['0 4', '0 2']} key={earning._id}>
        {monthEl}
        <Header
          date={earning.createdAt}
          amount={payout || -earning.cashOutAmt}
          text={text}
          bb={!post}
        />
        {post ? (
          <View border={screenSize ? null : 1}>
            <PostPreview screenSize={screenSize} community={community} postId={post} />
          </View>
        ) : null}
      </View>
    );
  }
}

Header.propTypes = {
  text: PropTypes.string,
  amount: PropTypes.number,
  date: PropTypes.string,
  bb: PropTypes.bool
};

function Header({ date, amount, text, bb }) {
  return (
    <View
      bt
      bl
      br
      bb={bb}
      p={'1.5 1'}
      fdirection="row"
      mt={2}
      bg={colors.secondaryBG}
      grow={1}
      justify="space-between"
    >
      <View display="flex" fdirection="row" wrap flex={1}>
        <BodyText mr={[4, 2]}>{date && numbers.getDayMonthYearTimestamp(date)}</BodyText>
        <BodyText c={colors.secondaryText}>{text}</BodyText>
      </View>
      {amount < 0 ? (
        <BodyText c={colors.red}>{numbers.abbreviateNumber(amount)} REL</BodyText>
      ) : (
        <BodyText c={colors.green}>+ {numbers.abbreviateNumber(amount)} REL</BodyText>
      )}
    </View>
  );
}
