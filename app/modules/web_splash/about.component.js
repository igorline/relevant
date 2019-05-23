import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Text, View, Image, Button } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts, sizing, size, responsive } from 'app/styles';
import * as navigationActions from 'modules/navigation/navigation.actions';
// import ULink from 'modules/navigation/ULink.component';
import Marquee from './post.marquee';

// const mobilePhone = `
//   position: absolute;
//   bottom: 0;
//   width: 80vw;
//   right: -40px;
//   opacity: .3;
// `;

// const Phone = styled(View)`
//   flex: 0.65;
//   align-self: flex-end;
//   transform-origin: bottom;
//   z-index: -1;
//   display: block;
//   ${p => (p.screenSize ? mobilePhone : '')}
// `;

const Wrapper = styled(View)`
  margin: auto;
  padding: ${sizing(2)};
  max-width: ${sizing(120)};
`;

const Section = styled(View)`
  flex: 1;
  min-height: 90vh;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid ${colors.black};
  padding: ${sizing(4)} 0;
`;

const ColumnContainer = styled(View)`
  flex-direction: ${() => responsive(['row', 'column'])};
`;

const Column = styled(View)`
  flex: 1;
  flex-direction: column;
`;

const SplashText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE_MEDIUM};
  color: ${colors.black};
  font-size: ${() => size(4.5)};
  line-height: ${() => size(6)};
  margin-bottom: ${() => size(4)};
`;

const SectionText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE};
  flex-direction: column;
  font-size: ${() => size(3)};
  line-height: ${() => size(4)};
  margin-bottom: ${() => size(2)};
`;

class Splash extends Component {
  static propTypes = {
    // screenSize: PropTypes.number,
    actions: PropTypes.object
  };

  onScroll = () => {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  };

  render() {
    const { actions } = this.props;
    // const img = '/img/hand-transparent.png';
    // const learnMoreUrl =
    // 'https://blog.relevant.community/relevant-beta-is-live-c385d0e1286c';

    return (
      <View flex={1} fdirection="column">
        <Marquee />
        <Wrapper
          ref={c => (this.container = c)}
          justify="flex-start"
          align="center"
          fdirection="column"
        >
          <Section bb={colors.black}>
            <ColumnContainer>
              <Column>
                <Image
                  h={6}
                  w={34}
                  mb={6}
                  resizeMode={'contain'}
                  src={'/img/logo-opt.png'}
                  alt={'Relevant'}
                />
              </Column>
              <Column>
                <SplashText fdirection="column">
                  <Text>The only social network built on trust.</Text>
                  <Text mt={4}>
                    Join a community, build reputation, and earn rewards.
                  </Text>
                </SplashText>
                <Button
                  h={8}
                  p={'0 6'}
                  mr={'auto'}
                  mt={4}
                  onClick={() => actions.showModal('signupSocial')}
                >
                  Join Relevant
                </Button>
                <SectionText mt={2} inline={1}>
                  or,{' '}
                  <Text
                    style={{ textDecoration: 'underline' }}
                    inline={1}
                    onClick={() => actions.showModal('login')}
                    c={colors.blue}
                  >
                    Log In
                  </Text>
                </SectionText>
              </Column>
            </ColumnContainer>
          </Section>

          <Section bb>
            <ColumnContainer>
              <Column mr={[6, 0]}>
                <SplashText>
                  <Text>A new kind of social network</Text>
                </SplashText>
              </Column>
              <Column>
                <SectionText>
                  At Relevant, we’re building a network that replaces popularity-centric
                  feeds in favor of reputation-based community forums.
                </SectionText>
                <SectionText>
                  Instead of sorting content by clicks and likes, we’ve created a trust
                  metric that incentivizes users to rank information according to its
                  value.
                </SectionText>
                <SectionText>
                  The result is a network of high-quality, community-specific feeds that
                  make finding relevant information easy.
                </SectionText>
              </Column>
            </ColumnContainer>
          </Section>

          <Section>
            <View>
              <SplashText>How it works —</SplashText>
            </View>
            <ColumnContainer>
              <View>
                <Image mt={1.25} mr={1} w={4} h={4} src="img/r-big.png" />
                <Column pr={[6, 0]}>
                  <SplashText>Reputation</SplashText>
                  <SectionText>
                    Each user has a Reputation score. Users earn reputation when reputable
                    community members upvote their comments. Content and links are also
                    ranked according to user Reputation.
                  </SectionText>
                  <SectionText>
                    The higher your score, the more say you have over what shows up in the
                    community feed. Reputation scores are community-specific and cannot be
                    transferred between networks.
                  </SectionText>
                </Column>
              </View>
              <View>
                <Image mt={1.25} mr={1} w={4} h={4} src="img/relevantcoin.png" />
                <Column>
                  <SplashText>Coins</SplashText>
                  <SectionText>
                    Users can earn Relevant coins by upvoting quality posts. You have 3
                    days to upvote a post after it goes live. If other users with a high
                    reputation also upvote the post, you’ll earn coins.
                  </SectionText>
                  <SectionText>
                    You can’t earn coins from posting content, only from upvoting, and
                    having more coins doesn’t impact your reputation score, only your
                    ownership in the platform.
                  </SectionText>
                </Column>
              </View>
            </ColumnContainer>
          </Section>
        </Wrapper>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    screenSize: state.navigation.screenSize
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);
