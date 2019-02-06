import React from 'react';
import { View, Text, Title, Button, ImageWrapper, Image } from 'modules/styled/uni';
import { colors } from 'app/styles';

const coin = require('app/public/img/relevantcoin.png');
const upvote = require('app/public/img/upvote.png');

export const onboarding = {
  title: 'Welcome To Relevant',
  body: (
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
        Boost your Reputation by posting quality comments. The most reputable users become
        community leaders.
      </Text>

      <ImageWrapper mt={6}>
        <Image resizeMode={'contain'} w={2.8} h={2.8} mr={0.75} source={upvote} />
        <Title>Curate Content</Title>
      </ImageWrapper>
      <Text fs={1.75} c={colors.black} mt={1}>
        Filter out clickbait and earn coins by upvoting quality links and downvoting spam.
      </Text>

      <ImageWrapper mt={6}>
        <Image resizeMode={'contain'} w={2.8} h={2.8} mr={0.75} source={coin} />
        <Title>Earn Rewards</Title>
      </ImageWrapper>

      <Text fs={1.75} mt={1}>
        As your Reputation grows so does your voting impact, and your earnings.
      </Text>
    </View>
  ),
  footer: p => (
    <View align={'flex-start'} mt={3}>
      <Button onPress={() => p.close()}>Got It</Button>
    </View>
  )
};
