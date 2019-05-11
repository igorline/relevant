/* eslint-disable */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts, sizing } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';

const mobilePhone = `
  position: absolute;
  bottom: 0;
  width: 80vw;
  right: -40px;
  opacity: .3;
`;

const Phone = styled(View)`
  flex: 0.65;
  align-self: flex-end;
  transform-origin: bottom;
  z-index: -1;
  display: block;
  ${p => (p.screenSize ? mobilePhone : '')}
`;

const Wrapper = styled(View)`
  margin: auto;
  max-width: ${sizing(100)};
`;

const SplashText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE_MEDIUM};
  color: ${colors.black};
`;

const OutlineText = styled(SplashText)`
  font-family: 'Outline';
  color: black;
  line-height: 0.8;
`;

const SubHeader = styled(Text)`
  font-family: ${fonts.GEORGIA};
  display: inline;
`;

const sectionText = styled(Text)`
  font-family: ${fonts.GEORGIA};
  flex-direction: column;
`;

export default class Splash extends Component {
  static propTypes = {
    screenSize: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }

  onScroll() {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  render() {
    const { screenSize } = this.props;
    const img = '/img/hand-transparent.png';
    const learnMoreUrl =
      'https://blog.relevant.community/relevant-beta-is-live-c385d0e1286c';

    return (
      <Wrapper
        ref={c => (this.container = c)}
        className="splashContent"
        display="flex"
        justify="flex-start"
        align="center"
        fdirection="row"
        of="hidden"
        bb
      >
        <View
          className="mainSection"
          m={['12 12 0 12', '4 2 0 2']}
          flex={1}
          justify="center"
          align={['flex-start', 'stretch']}
          fdirection="column"
        >
          <View fdirection="column">
            <SplashText fdirection="column" fs={[6, 3]} lh={[9, 4.2]}>
              <OutlineText inheritfont={1} m={0} p={0}>
                Relevant.
              </OutlineText>{' '}
              <Text>The only social network built on trust.</Text>
              <Text>Join a community, build reputation,and earn rewards.</Text>
            </SplashText>
            <View mt={[5, 2]} mb={[8, 4]}>
              <SubHeader fs={[2.5, 1.5]} lh={[4, 3]}>
                Join the thought leaders, build trust and earn rewards.{' '}
                <ULink
                  to={learnMoreUrl}
                  external
                  target="_blank"
                  display="inline"
                  td="underline"
                >
                  Learn More
                </ULink>
              </SubHeader>
            </View>
          </View>

          <View fdirection="column">
            <SplashText fdirection="column" fs={[6, 3]} lh={[9, 4.2]}>
              <Text>A new kind of social network</Text>
            </SplashText>
            <View fdirection={'column'} mt={[5, 2]} mb={[8, 4]}>
              <Text fs={[2.5, 1.5]} lh={[4, 3]} mt={'4'}>
                At Relevant, we’re building a network that replaces popularity-centric
                feeds in favor of reputation-based community forums.
              </Text>
              <Text fs={[2.5, 1.5]} lh={[4, 3]} mt={'4'}>
                Instead of sorting content by clicks and likes, we’ve created a trust
                metric that incentivizes users to rank information according to its value.
              </Text>
              <Text fs={[2.5, 1.5]} lh={[4, 3]} mt={'4'}>
                The result is a network of high-quality, community-specific feeds that
                make finding relevant information easy.
              </Text>
            </View>
          </View>

          <View fdirection="column">
            <SplashText fdirection="column" fs={[6, 3]} lh={[9, 4.2]}>
              <Text>How it works —</Text>
            </SplashText>
            <SplashText fdirection="column" fs={[6, 3]} lh={[9, 4.2]}>
              <Text>Reputation</Text>
            </SplashText>
            <View mt={[5, 2]} mb={[8, 4]}>
              <sectionText fs={[2.5, 1.5]} lh={[4, 3]}>
                Each user has a Reputation score. Users earn reputation when reputable
                community members upvote their comments. Content and links are also ranked
                according to user Reputation. The higher your score, the more say you have
                over what shows up in the community feed. Reputation scores are
                community-specific and cannot be transferred between networks.
              </sectionText>
            </View>
          </View>
        </View>
      </Wrapper>
    );
  }
}
