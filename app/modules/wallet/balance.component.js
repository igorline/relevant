import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { abbreviateNumber } from 'app/utils/numbers';
import { truncateAddress } from 'app/utils/eth';
import { usePrice } from 'modules/wallet/price.context';
import { View, BodyText, Header, SecondaryText } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { CASHOUT_MAX } from 'server/config/globalConstants';
import Tooltip from 'modules/tooltip/tooltip.component';
// import { updateNotificationSettings } from 'modules/auth/auth.actions';
// import { TEXT } from 'modules/bannerPrompt/betBanner';
// import { NotificationToggle } from 'modules/profile/settings/settings.toggle';
import WalletLinks from './walletLinks';

export function Balance() {
  const user = useSelector(state => state.auth.user);
  const screenSize = useSelector(state => state.navigation.screenSize);
  // const dispatch = useDispatch();

  const maxUSD = usePrice(CASHOUT_MAX);

  if (!user) return null;
  const metaMaskTokens = user.tokenBalance;

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

  // const enableManualBet = () => {
  //   dispatch(updateNotificationSettings({ bet: { manual: true } }));
  // };

  return (
    <View m={['0 4 2 4', '2 2 0 2']}>
      {!screenSize ? (
        <View>
          <BodyText mt={2}>
            These are coins you earned as rewards. You can transfer up to {CASHOUT_MAX}
            {maxUSD} coins to your Ethereum wallet (this limit will be increased as the
            network grows).
          </BodyText>
        </View>
      ) : null}
      <View br bl bt p="2" mt={2}>
        <View fdirection="row" justify="space-between" wrap>
          <BodyText mb={0.5}>Account Balance</BodyText>
          <SecondaryText>{truncateAddress(user.ethAddress[0])}</SecondaryText>
        </View>
        <View fdirection="row" align="center" display="flex" mt={2}>
          <CoinStat fs={4.5} lh={5} size={5} user={user} align="center" showPrice />
        </View>
      </View>

      <View fdirection="row" wrap border={1} p="2">
        {accountDetail.map(
          detail =>
            (!!detail.value || !detail.alwayShow) && (
              <View key={detail.text}>
                {detail.tip && (
                  <Tooltip
                    name={detail.text.replace(' ', '')}
                    data={{ text: detail.tip }}
                  />
                )}
                <SecondaryText mr={2}>
                  {detail.text}: {abbreviateNumber(detail.value)}
                </SecondaryText>
              </View>
            )
        )}
      </View>
      <WalletLinks />

      {/*      <BodyText inline={1}>
        {TEXT.messageText}
        <ULink to="#">
          <Text inline={1} onClick={enableManualBet}>
            {TEXT.actionText}
          </Text>
        </ULink>
      </BodyText> */}
      {/*      <View maxWidth={40}>
        <NotificationToggle
          notification={user.notificationSettings.bet.manual}
          parent={'bet'}
          label={'manual'}
          togglePosition={'right'}
          DescriptionComponent={BodyText}
          text={{
            description: 'Enable manual betting:'
          }}
        />
      </View> */}

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

export default memo(Balance);
