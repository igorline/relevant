import React from 'react';
import PropTypes from 'prop-types';
import Eth from 'modules/web_ethTools/eth.context';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { NumericalValue } from 'modules/styled';
import { Icon, IconWrapper } from './styled.components';

const coinImage = require('app/public/img/relevantcoin.png');

function CoinStat(props) {
  const { user, isOwner, wallet, size, amount, inherit, mr } = props;

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


  return (
    <IconWrapper mr={mr}>
      <Icon source={coinImage} size={size} />
      <NumericalValue size={size} inherit={inherit ? 1 : 0}>
        {abbreviateNumber(tokens) || 0}
      </NumericalValue>
    </IconWrapper>
  );
}

CoinStat.propTypes = {
  mr: PropTypes.number,
  inherit: PropTypes.bool,
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
