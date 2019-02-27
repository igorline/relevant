import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Button, Image, BodyText, Divider } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { colors } from 'app/styles';
import { TWITTER_REWARD, EMAIL_REWARD } from 'server/config/globalConstants';
import ULink from 'modules/navigation/ULink.component';

const twitterIcon = '/img/icons/twitter_white.png';

class GetTokensModal extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  render() {
    const {
      auth: { user },
      actions: { sendConfirmation, showModal }
    } = this.props;
    return (
      <View display="flex" fdirection="column">
        <View display="flex" fdirection="row" align="center">
          <BodyText c={colors.secondaryText}>
            Connect your Relevant account with your Twitter account to earn
          </BodyText>
          <CoinStat size={2} amount={TWITTER_REWARD} align="center" ml={0.5} />
        </View>
        <ULink to="/auth/twitter" external mr="auto" mt={3}>
          <Button bg={colors.twitterBlue} m={0}>
            <Image source={twitterIcon} w={2} h={2} mr={2} />
            Connect Twitter
          </Button>
        </ULink>
        <Divider mt={4} />
        {user.confirmed ? (
          <View fdirection="column">
            <View display="flex" fdirection="row" align="center" mt={4}>
              <BodyText c={colors.secondaryText}>Confirm your e-mail to earn</BodyText>
              <CoinStat size={2} amount={EMAIL_REWARD} align="center" ml={0.5} />
            </View>
            <ULink
              to="#"
              onClick={sendConfirmation}
              onPress={sendConfirmation}
              external
              mr="auto"
              mt={3}
            >
              <Button m={0}>Confirm E-mail</Button>
            </ULink>
            <Divider mt={4} />
          </View>
        ) : null}
        <View>
          <ULink
            to="#"
            onClick={() => showModal('invite')}
            onPress={() => showModal('invite')}
            external
            mr="auto"
            mt={4}
          >
            Invite Friends
          </ULink>
        </View>
      </View>
    );
  }
}

export default GetTokensModal;
