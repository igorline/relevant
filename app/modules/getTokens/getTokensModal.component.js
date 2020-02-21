import React, { Fragment } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  HoverButton,
  BodyText,
  Divider,
  LinkFont,
  SecondaryText,
  ViewButton
} from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import {
  TWITTER_REWARD,
  EMAIL_REWARD
  // REDDIT_REWARD
} from 'server/config/globalConstants';
import ULink from 'modules/navigation/ULink.component';
import { colors } from 'app/styles';
import { exchangeLink, tokenEnabled } from 'modules/wallet/price.context';
import { goToUrl } from 'modules/navigation/navigation.actions';

GetTokensModal.propTypes = {
  actions: PropTypes.object,
  auth: PropTypes.object,
  mobile: PropTypes.bool,
  twitterButton: PropTypes.node
  // redditButton: PropTypes.node
};

function GetTokensModal({
  auth: { user },
  actions: { sendConfirmation, showModal, push },
  mobile,
  twitterButton
  // redditButton
}) {
  return (
    <View display="flex" fdirection="column">
      {tokenEnabled() && (
        <Fragment>
          <UniswapButton />
          <Divider mt={4} />
        </Fragment>
      )}
      {!user.confirmed && (
        <View fdirection="column" justify={'stretch'}>
          <View fdirection="row" align="center" mt={4}>
            <BodyText c={colors.secondaryText} inline={1}>
              Confirm your e-mail to earn{' '}
              <CoinStat inline={1} size={2} amount={EMAIL_REWARD} />{' '}
              {EMAIL_REWARD > 1 ? 'coins' : 'coin'}
              <SecondaryText>
                *if you don't see a confirmation email in your inbox, please check your
                spam folder
              </SecondaryText>
            </BodyText>
          </View>
          <ULink
            to="#"
            onClick={sendConfirmation}
            onPress={sendConfirmation}
            external
            mr={['auto', 0]}
            mobile={mobile}
          >
            <ViewButton w={[22, 'auto']} mt={3} mobile={mobile}>
              <LinkFont c={colors.white}>Confirm E-mail</LinkFont>
            </ViewButton>
          </ULink>
          <Divider mt={4} />
        </View>
      )}

      {!user.twitterId && (
        <View>
          <View fdirection="row" align="center" mt={4}>
            <BodyText c={colors.secondaryText} inline={1}>
              Connect your Relevant account with your Twitter account to earn{' '}
              <CoinStat
                inline={1}
                size={2}
                amount={user.confirmed ? TWITTER_REWARD : TWITTER_REWARD + EMAIL_REWARD}
              />{' '}
              {TWITTER_REWARD > 1 ? 'coins' : 'coin'}
            </BodyText>
          </View>
          {twitterButton}
          <Divider mt={4} />
        </View>
      )}
      {/*
      {!user.redditId && redditButton && (
        <View>
          <View mt={4} fdirection="row" align="center">
            <BodyText c={colors.secondaryText} inline={1}>
              Connect your Relevant account with your Reddit account to earn{' '}
              <CoinStat inline={1} size={2} amount={REDDIT_REWARD} />{' '}
              {REDDIT_REWARD > 1 ? 'coins' : 'coin'}
            </BodyText>
          </View>
          {redditButton}
          <Divider mt={4} />
        </View>
      )}
      */}
      <View mt={4}>
        <ULink
          to="#"
          onClick={() => showModal('invite')}
          onPress={() => push('invites')}
          external
          mr="auto"
          mobile={mobile}
        >
          <LinkFont c={colors.blue}>Invite Friends</LinkFont>
        </ULink>
      </View>
    </View>
  );
}

function UniswapButton() {
  const dispatch = useDispatch();
  const uniIcon = require('app/public/img/uniswap.png');
  const exchageUrl = exchangeLink();

  return (
    <ULink inline={1} to={exchageUrl} external mr={['auto', 0]} mt={3} target="_blank">
      <HoverButton
        w={[22, 'auto']}
        bg={colors.uniswap}
        m={0}
        c={colors.white}
        onPress={() => dispatch(goToUrl(exchageUrl))}
      >
        <View fdirection="row" justify={'center'} align="center">
          <Image resizeMode="contain" source={uniIcon} w={3} h={3} mr={1.5} />
          <LinkFont c={colors.white}>Uniswap Exchange</LinkFont>
        </View>
      </HoverButton>
    </ULink>
  );
}

export default GetTokensModal;
