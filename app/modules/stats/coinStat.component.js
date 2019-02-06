import React from 'react';
import PropTypes from 'prop-types';
import Eth from 'modules/web_ethTools/eth.context';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { Image, ImageWrapper, NumericalValue } from 'modules/styled/uni';
import { sizing, mixins } from 'app/styles';
import styled from 'styled-components/primitives';

const coinImage = require('app/public/img/relevantcoin.png');

const StyledNumericalValue = styled(NumericalValue)`
  ${mixins.inheritfont}
  ${p => (p.lineheight ? `line-height: ${p.lineheight};` : '')}
`;

function CoinStat(props) {
  const {
    user,
    isOwner,
    wallet,
    size,
    amount,
    inheritfont,
    mr,
    align,
    lineheight,
    ...rest
  } = props;

  let tokens;
  if (typeof amount === 'number') tokens = amount;
  else if (user) {
    tokens = user.balance;
    if (user.tokenBalance) tokens += user.tokenBalance;
  }

  if (isOwner && user.ethAddress && user.ethAddress[0] && wallet.connectedBalance) {
    tokens = wallet.connectedBalance + user.balance;
  }
  const iconSize = size || 3;
  const imageMarginBottom = align === 'center' ? 0 : sizing(-size / 10);

  return (
    <ImageWrapper mr={mr || 1.5} align={align} {...rest}>
      <Image
        source={coinImage}
        h={iconSize}
        w={iconSize}
        mr={iconSize / 4}
        style={{ bottom: imageMarginBottom }}
        resizeMode="contain"
      />
      <StyledNumericalValue
        inheritfont={inheritfont ? 1 : 0}
        lineheight={lineheight ? sizing(lineheight) : null}
      >
        {abbreviateNumber(tokens) || 0}
      </StyledNumericalValue>
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
  wallet: PropTypes.object,
  align: PropTypes.string,
  lineheight: PropTypes.string
};

export default props => (
  <Eth.Consumer>{wallet => <CoinStat wallet={wallet} {...props} />}</Eth.Consumer>
);
