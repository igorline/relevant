import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Title, Button, ImageWrapper, Image } from 'modules/styled/uni';
import { colors } from 'app/styles';

const coin = require('app/public/img/relevantcoin.png');
const upvote = require('app/public/img/upvote.png');

const OnboardingModal = props => (
  <View>
    <ImageWrapper mt={6}>
      <Image
        resizeMode={'contain'}
        w={2.8}
        h={2.8}
        mr={0.75}
        source={require('app/public/img/r-emoji.png')}
      />
      <Title>Build Trust</Title>
    </ImageWrapper>
    <Text fs={1.75} mt={1}>
      Boost your Reputation by posting quality comments. As your Reputation ® grows so
      does your voting impact, and your earnings. The most reputable users become
      community leaders.
    </Text>

    <ImageWrapper mt={6}>
      <Image resizeMode={'contain'} w={2.8} h={2.8} mr={0.75} source={upvote} />
      <Title>Curate Content</Title>
    </ImageWrapper>
    <Text fs={1.75} c={colors.black} mt={1}>
      Share links, upvote quality content and downvote spam.
    </Text>

    <ImageWrapper mt={6}>
      <Image resizeMode={'contain'} w={2.8} h={2.8} mr={0.75} source={coin} />
      <Title>Get Rewards</Title>
    </ImageWrapper>

    <Text fs={1.75} mt={1}>
      Earn coins for posting and upvoting quality links. Coins can be traded in for
      Relevant Tokens that represent ownership in the platform.
    </Text>
    <View align={'flex-start'} mt={3}>
      <Button onPress={() => props.close()}>Got It</Button>
    </View>
  </View>
);

OnboardingModal.propTypes = {
  close: PropTypes.func
};

export default OnboardingModal;
