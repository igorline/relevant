import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { abbreviateNumber } from 'app/utils/numbers';
import { truncateAddress } from 'app/utils/eth';

import {
  View,
  BodyText,
  Header,
  SecondaryText,
  Touchable,
  LinkFont
} from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { CASHOUT_MAX } from 'server/config/globalConstants';
// import { parseBN } from 'app/utils/eth';
import Tooltip from 'modules/tooltip/tooltip.component';
import { showModal } from 'modules/navigation/navigation.actions';
// import { useTokenContract } from 'modules/contract/contract.hooks';

Balance.propTypes = {
  isWeb: PropTypes.bool
};

export function Balance({ isWeb }) {
  // Temporarily disable - don't want to trigger metamask popup here
  // useTokenContract();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const screenSize = useSelector(state => state.navigation.screenSize);

  // const userBalance = useBalance();

  if (!user) return null;
  const metaMaskTokens = user.tokenBalance;
  // userBalance && userBalance.phase === 'SUCCESS'
  // ? parseBN(userBalance.value)
  // : user.tokenBalance;
  const { airdropTokens, lockedTokens } = user;
  const stakingPower = user.balance
    ? Math.round(100 * (1 - lockedTokens / user.balance))
    : 0;

  const unclaimed = user.balance - user.airdropTokens;

  const accountDetail = getAccountDetail({
    unclaimed,
    metaMaskTokens,
    airdropTokens,
    lockedTokens,
    stakingPower
  });

  return (
    <View m={['4 4 2 4', '2 2 0 2']}>
      {!screenSize ? (
        <View>
          <Header>Relevant Tokens</Header>
          <BodyText mt={2}>
            These are coins you earned as rewards. You can transfer up to {CASHOUT_MAX}{' '}
            coins to your Ethereum account (this limit will be increased as the network
            grows).
          </BodyText>
        </View>
      ) : null}
      <View br bl bt p="2" mt={2}>
        <View fdirection="row" justify="space-between" wrap>
          <BodyText mb={0.5}>Account Balance</BodyText>
          <SecondaryText mb={0.5}>{truncateAddress(user.ethAddress[0])}</SecondaryText>
        </View>
        <View fdirection="row" align="center" display="flex" mt={2}>
          <CoinStat fs={4.5} lh={5} size={5} user={user} align="center" />
        </View>
      </View>

      <View fdirection="row" wrap border={1} p="2">
        {accountDetail.map(
          detail =>
            (!!detail.value || !detail.alwayShow) && (
              <View>
                {detail.tip && (
                  <Tooltip
                    name={detail.text.replace(' ', '')}
                    data={{ text: detail.tip }}
                  />
                )}
                <SecondaryText mr={2} key={detail.text}>
                  {detail.text}: {abbreviateNumber(detail.value)}
                </SecondaryText>
              </View>
            )
        )}
      </View>

      {isWeb ? (
        <View fdirection="row" mt={2} align="center">
          <Touchable onClick={() => dispatch(showModal('cashOut'))} td={'underline'}>
            <LinkFont c={colors.blue} mr={0.5}>
              Claim Tokens
            </LinkFont>
          </Touchable>
          <Tooltip
            info
            data={{
              text: `You can transfer up to ${CASHOUT_MAX} coins to your your Metamask wallet.\n(You cannot transfer coins you got for refferrals and verifying social accounts.)`
            }}
          />
        </View>
      ) : null}
      <Header mt={[9, 4]}>Recent Activity</Header>
      {!screenSize ? (
        <BodyText mt={2}>
          Your rewards for upvoting links and discussion threads that are relevant to the
          community.
        </BodyText>
      ) : null}
    </View>
  );
}

function getAccountDetail({
  unclaimed,
  metaMaskTokens,
  airdropTokens,
  lockedTokens,
  stakingPower
}) {
  return [
    {
      text: 'Unclaimed Coins',
      value: Math.max(unclaimed, 0),
      tip: 'You can transfer these coins to your Ethereum wallet.'
    },
    {
      text: 'Metamask Coins',
      value: metaMaskTokens,
      tip: 'These are the coins located in your connected Ethereum wallet.'
    },
    {
      text: 'Airdrop Coins',
      value: airdropTokens,
      tip:
        'These are coins you got for referrals and verifying social accounts.\nYou cannot transfer these coins to Metamask.',
      alwaysShow: true
    },
    {
      text: 'Locked Tokens Coins',
      value: lockedTokens,
      tip:
        'These are coins that you are currently betting on posts.\nThey get unlocked once the bets expire.'
    },
    {
      text: 'Staking Power',
      value: stakingPower + '%',
      tip: 'This is the ratio between unlocked and locked coins.',
      alwaysShow: true,
      stringValue: true
    }
  ];
}

export default Balance;
