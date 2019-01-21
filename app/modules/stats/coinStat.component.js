import React from 'react';
import PropTypes from 'prop-types';
import Eth from 'modules/web_ethTools/eth.context';
import styled from 'styled-components/primitives';
import { statNumbers } from 'app/styles/fonts';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';

const Wrapper = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
`;

const StyledNumber = styled.Text`
  ${statNumbers}
`;

const Coin = styled.Image`
  width: 30px;
  height: 30px;
  margin-right: 5px;
`;

const coinImage = require('app/public/img/relevantcoin.png');

function CoinStat(props) {
  const { user, isOwner, wallet } = props;

  const fixed = n => abbreviateNumber(n, 2);

  let tokens = user.balance;
  if (user.tokenBalance) tokens += user.tokenBalance;
  if (
    isOwner &&
    user.ethAddress &&
    user.ethAddress[0] &&
    wallet.connectedBalance
  ) {
    tokens = wallet.connectedBalance + user.balance;
  }

  return (
    <Wrapper>
      <Coin source={coinImage} />
      <StyledNumber>{fixed(tokens) || 0}</StyledNumber>
    </Wrapper>
  );
}

CoinStat.propTypes = {
  user: userProps.isRequired,
  isOwner: PropTypes.bool.isRequired,
  wallet: PropTypes.object
};

export default props => <Eth.Consumer>{wallet =>
  <CoinStat
    wallet={wallet}
    {...props}
  />}
</Eth.Consumer>;
