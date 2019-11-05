import React from 'react';
import { useDispatch } from 'react-redux';
import { colors, isNative } from 'app/styles';
import { exchangeLink, tokenEnabled } from 'modules/wallet/price.context';
import { goToUrl, showModal } from 'modules/navigation/navigation.actions';
import { Touchable, LinkFont, View } from 'modules/styled/uni';
import { CASHOUT_MAX } from 'server/config/globalConstants';
import Tooltip from 'modules/tooltip/tooltip.component';
import ULink from 'modules/navigation/ULink.component';

export default function WalletLinks() {
  const dispatch = useDispatch();
  if (isNative) return null;
  const exchageUrl = exchangeLink();

  return (
    <View fdirection="row">
      <View mr={2} fdirection="row" mt={2} align="center">
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
      <View mr={2} fdirection="row" mt={2} align="center">
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

      <View fdirection="row" mt={2} align="center">
        {tokenEnabled() && (
          <ULink to={exchageUrl} external target="_blank" td={'underline'}>
            <LinkFont
              mt={0.5}
              c={colors.blue}
              onPress={() => {
                dispatch(goToUrl(exchageUrl));
              }}
            >
              Get more coins
            </LinkFont>
          </ULink>
        )}
      </View>
    </View>
  );
}
