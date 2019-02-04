import React from 'react';
import PropTypes from 'prop-types';
import Eth from 'modules/web_ethTools/eth.context';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { Image, ImageWrapper } from 'modules/styled/uni';
import { sizing, fonts, mixins } from 'app/styles';
import styled from 'styled-components/primitives';

const coinImage = require('app/public/img/relevantcoin.png');

const NumericalValue = styled.Text`
  ${fonts.numericalValue}
  ${mixins.inheritfont}
`;

function CoinStat(props) {
  const { user, isOwner, wallet, size, amount, inheritfont, mr } = props;

  let tokens;
  if (typeof amount === 'number') tokens = amount;
  else if (user) {
    tokens = user.balance;
    if (user.tokenBalance) tokens += user.tokenBalance;
  }

  if (
    isOwner &&
    user.ethAddress &&
    user.ethAddress[0] &&
    wallet.connectedBalance
  ) {
    tokens = wallet.connectedBalance + user.balance;
  }
  const iconSize = size || 3;

  return (
    <ImageWrapper mr={sizing(mr || 1.5)}>
      <Image
        source={coinImage}
        h={sizing(iconSize)}
        w={sizing(iconSize)}
        mr={sizing(iconSize / 4)}
      />
      <NumericalValue inheritfont={inheritfont ? 1 : 0}>
        {abbreviateNumber(tokens) || 0}
      </NumericalValue>
    </ImageWrapper>
  );
}

CoinStat.propTypes = {
  mr: PropTypes.number,
  inheritfont: PropTypes.bool,
  amount: PropTypes.number,
  size: PropTypes.number,
  user: userProps,
  isOwner: PropTypes.bool,
  wallet: PropTypes.object
};

export default props => <Eth.Consumer>{wallet =>
  <CoinStat
    wallet={wallet}
    {...props}
  />}
</Eth.Consumer>;
