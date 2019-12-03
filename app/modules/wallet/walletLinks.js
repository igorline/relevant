import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { colors, isNative } from 'app/styles';
import { exchangeLink, tokenEnabled } from 'modules/wallet/price.context';
import { goToUrl, showModal } from 'modules/navigation/navigation.actions';
import { Touchable, LinkFont, View } from 'modules/styled/uni';
import { CASHOUT_MAX } from 'server/config/globalConstants';
import Tooltip from 'modules/tooltip/tooltip.component';
import ULink from 'modules/navigation/ULink.component';
import { updateNotificationSettings } from 'modules/auth/auth.actions';

export default function WalletLinks() {
  const dispatch = useDispatch();
  const exchageUrl = exchangeLink();
  const user = useSelector(state => state.auth.user);
  if (isNative) return null;

  const isManualBet = user.notificationSettings.bet.manual;

  const toggleManualBet = () => {
    dispatch(updateNotificationSettings({ bet: { manual: !isManualBet } }));
  };

  return (
    <View mt={2} fdirection="row" wrap="wrap">
      <View mr={2} mt={1} fdirection="row" align="center">
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
      <View mr={2} mt={1} fdirection="row" align="center">
        <Tooltip
          data={{
            text: `If you have Relevant tokens in your Metamask wallet, you need to connect your account to be able to use them.`
          }}
        >
          <Touchable
            style={{ zIndex: 1 }}
            onClick={() => dispatch(showModal('connectMetamask'))}
            td={'underline'}
          >
            <LinkFont c={colors.blue} mr={0.5}>
              Connect Your Wallet
            </LinkFont>
          </Touchable>
        </Tooltip>
      </View>

      {tokenEnabled() && (
        <View mt={1} fdirection="row" mr={2} align="center">
          <ULink to={exchageUrl} external target="_blank" td={'underline'}>
            <LinkFont
              // mt={0.5}
              c={colors.blue}
              onPress={() => {
                dispatch(goToUrl(exchageUrl));
              }}
            >
              Get more coins
            </LinkFont>
          </ULink>
        </View>
      )}

      <View mt={1} fdirection="row" mr={2} align="center">
        <Tooltip
          data={{
            text: `When you upvote posts you also bet coins on them. How much you bet can be decided automatically or manualy.`
          }}
        >
          <Touchable style={{ zIndex: 1 }} onClick={toggleManualBet} td={'underline'}>
            <LinkFont c={colors.blue} mr={0.5}>
              {isManualBet ? 'Disable' : 'Enable'} Manual Betting
            </LinkFont>
          </Touchable>
        </Tooltip>
      </View>
    </View>
  );
}
