import React, { Component } from 'react';
import { View, Button, Image, BodyText } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';
import { colors } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';

const twitterIcon = '/img/icons/twitter_white.png';

class GetTokensModal extends Component {
  render() {
    return (
      <View display="flex" fdirection="column">
        <View display="flex" fdirection="row" align="center">
          <BodyText c={colors.secondaryText}>
            Connect your Relevant account with your Twitter account to earn
          </BodyText>
          <CoinStat size={2} amount={300} align="center" ml={0.5} />
        </View>
        <ULink to="/auth/twitter" external mr="auto" mt={6}>
          <Button bg={colors.twitterBlue} m={0}>
            <Image source={twitterIcon} w={2} h={2} mr={2} />
            Connect Twitter
          </Button>
        </ULink>
      </View>
    );
  }
}

export default GetTokensModal;
