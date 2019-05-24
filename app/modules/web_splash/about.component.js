import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Text, View, Image, Button } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts, sizing, size } from 'app/styles';
import * as navigationActions from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import CommunityList from 'modules/community/communityList.component';
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
  max-width: ${sizing(75)};
  top: 0;
`;

const Section = styled(View)`
  flex: 1;
  /* min-height: 90vh; */
  flex-direction: column;
  justify-content: center;
  padding: ${sizing(16)} 0;
`;

const SplashText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE};
  color: ${colors.black};
  font-size: ${() => size(4.5)};
  line-height: ${() => size(6)};
  margin: ${() => size(2)} 0;
`;

const SectionText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE};
  flex-direction: column;
  font-size: ${() => size(3)};
  line-height: ${() => size(3.8)};
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
          <Section style={{ minHeight: '100vh' }}>
            <Image
              h={8}
              // m={[4, 2]}
              mb={6}
              mr={'auto'}
              style={
                {
                  // top: 20,
                  // position: 'fixed'
                }
              }
              src={'/img//logo-opt.png'}
              alt={'Relevant'}
            />
            <SplashText>
              Tired of the social media
              <br />
              popularity game?
            </SplashText>
            <SplashText inline={1} mt={6}>
              Join a <ULink to="/community/all">Relevant Community</ULink> and get
              rewarded for your expertise.
            </SplashText>

            <Button
              h={8}
              p={'2 6'}
              mr={'auto'}
              mt={6}
              onClick={() => actions.showModal('signupSocial')}
            >
              <SectionText>Join Relevant</SectionText>
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
          </Section>

          <Section>
            <SplashText>
              Engagement metrics make it easy to find popular content, but they don’t help
              us determine what’s important, or who we can trust.
            </SplashText>
            <View h={16} m={'2 0'} mr={6} bg={'#FF4621'} />
          </Section>

          <Section>
            <SplashText>
              This is why we’ve built a manipulation-resistant Reputation metric that
              allows communities to identify experts and curate content according to its
              value.
            </SplashText>
            <View h={16} m={'2 0'} mr={6} bg={colors.blue} />
            <SplashText>
              The Relevant Reputation System puts curation power in the hands of trusted
              community members and experts instead of passive consumers.
            </SplashText>
          </Section>

          <Section>
            <SplashText>
              Advertising markets reward popularity. Prediction markets reward expertise.
            </SplashText>
            <SplashText>
              On Relevant users can bet on the relevance of content. Bets don’t impact
              rankings but provide a way to reward expert curators.
            </SplashText>
          </Section>

          <Section>
            <SplashText>
              Relevant Communities decide what kind of information is valuable to them and
              define their own trust metrics.
            </SplashText>
            <SplashText>
              No matter the context, community trust metrics will always represent what is
              valuable to their members.
            </SplashText>
            <SplashText>Here are a few communities you can join right now:</SplashText>
            <CommunityList />
          </Section>

          <Section>
            <View>
              <Image h={6} mr={2} src={'/img/appstore.png'} />
              <Image h={6} src={'/img/googleplaystore.png'} />
            </View>
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
