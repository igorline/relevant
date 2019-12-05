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
import { Alert } from 'utils/alert';

export default function WalletLinks() {
  const dispatch = useDispatch();
  const exchageUrl = exchangeLink();
  const user = useSelector(state => state.auth.user);
  const isManualBet = user.notificationSettings.bet.manual;

  const toggleManualBet = () => {
    dispatch(updateNotificationSettings({ bet: { manual: !isManualBet } }));
  };

  function claimTokens() {
    return isNative
      ? Alert().alert(
          'you can claim tokens via the Relevant browser app on https://relevant.community'
        )
      : dispatch(showModal('cashOut'));
  }

  return (
    <View mt={2} fdirection="row" wrap="wrap">
      {isNative && (
        <View mr={[2, 1]} mt={1} fdirection="row" align="center">
          <Tooltip
            name="coinInfo"
            data={{
              text: `You can get more coins or transfer up to ${CASHOUT_MAX} coins to your your Metamask wallet via the browser app on https://relevant.community.`
            }}
          />
          <LinkFont c={colors.blue} mr={0.5}>
            Manage Coins
          </LinkFont>
        </View>
      )}

      {!isNative && (
        <View mr={[2, 1]} mt={1} fdirection="row" align="center">
          <Touchable onPress={claimTokens} td={'underline'}>
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
      )}
      {!isNative && (
        <View mr={[2, 1]} mt={1} fdirection="row" align="center">
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
              <LinkFont c={colors.blue}>Connect Your Wallet</LinkFont>
            </Touchable>
          </Tooltip>
        </View>
      )}

      {tokenEnabled() && !isNative && (
        <View mt={1} fdirection="row" mr={[2, 1]} align="center">
          <ULink to={exchageUrl} external target="_blank">
            <LinkFont
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

      <View mt={1} fdirection="row" align="center">
        <Tooltip
          data={{
            text: `When you upvote posts you also bet coins on them. How much you bet can be decided automatically or manualy.`
          }}
        >
          <Touchable style={{ zIndex: 1 }} onPress={toggleManualBet} td={'underline'}>
            <LinkFont c={colors.blue}>
              {isManualBet ? 'Disable' : 'Enable'} Betting Mode
            </LinkFont>
          </Touchable>
        </Tooltip>
      </View>
    </View>
  );
}
