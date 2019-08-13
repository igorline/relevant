import React from 'react';
import PropTypes from 'prop-types';
import Eth from 'modules/web_ethTools/eth.context';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { sizing } from 'app/styles';
import {
  Image,
  ImageWrapper,
  NumericalValue,
  SecondaryText,
  Text
} from 'modules/styled/uni';

const coinImage = require('app/public/img/relevantcoin.png');

function CoinStat(props) {
  const {
    user,
    isOwner,
    wallet,
    size,
    amount,
    mr,
    align,
    noNumber,
    secondary,
    fs,
    lh,
    inline,
    c,
    spaceBetween,
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
  const iconSize = typeof size === 'number' ? size : 3;
  const NumberStyle = secondary ? SecondaryText : NumericalValue;
  const imageMargin = align === 'center' ? 0 : sizing(-1, 'px');
  const Wrapper = inline ? Text : ImageWrapper;

  let spacer = 0;
  if (!inline && iconSize) {
    spacer = iconSize / 4;
  }
  if (!inline && spaceBetween) {
    spacer = spaceBetween;
  }

  return (
    <Wrapper
      {...rest}
      inline={inline ? 1 : 0}
      mr={typeof mr === 'number' ? mr : inline ? 0 : 1.5}
      align={align}
    >
      <Image
        inline={inline ? 1 : 0}
        source={coinImage}
        h={iconSize * 1}
        w={iconSize * 1.05}
        style={{ bottom: imageMargin }}
        resizeMode="contain"
      />

      {noNumber ? null : (
        <NumberStyle ml={spacer} fs={fs} lh={lh} inline={inline ? 1 : 0} c={c}>
          {inline ? ' ' : ''}
          {abbreviateNumber(tokens)}
        </NumberStyle>
      )}
    </Wrapper>
  );
}

CoinStat.propTypes = {
  lh: PropTypes.number,
  inline: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  secondary: PropTypes.bool,
  mr: PropTypes.number,
  fs: PropTypes.number,
  amount: PropTypes.number,
  size: PropTypes.number,
  user: userProps,
  isOwner: PropTypes.bool,
  wallet: PropTypes.object,
  align: PropTypes.string,
  lineheight: PropTypes.string,
  c: PropTypes.string,
  noNumber: PropTypes.bool,
  spaceBetween: PropTypes.number
};

export default props => (
  <Eth.Consumer>{wallet => <CoinStat wallet={wallet} {...props} />}</Eth.Consumer>
);
