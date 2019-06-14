import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Text, View, Image, Button } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts, sizing, size, responsive } from 'app/styles';
import { tween } from 'app/utils';
import * as navigationActions from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import CommunityList from 'modules/community/communityList.component';
import SocialIcons from 'modules/navigation/social.icons';
import Marquee from './post.marquee';
import CountUp from './countUp/countUp.component';

const SHOW_FIXED_JOIN_HEIGHT = 1200;
const SHOW_FIXED_LOGO = 2000;

const Phone = styled(Image)`
  position: ${() => responsive(['relative', 'absolute'])};
  bottom: ${() => responsive(['auto', '0'])};
  right: ${() => responsive(['auto', '-20vw'])};
  opacity: ${() => responsive([1, 0.5])};
`;

const Join = styled(View)`
  position: fixed;
  left: 50%;
  transform: translate3d(-50%, ${p => (p.visible ? '0px' : '200px')}, 0);
  transition: transform 0.8s ease-out;
  bottom: ${sizing(4)};
  z-index: 1000;
`;

const FixedLogo = styled(View)`
  position: fixed;
  left: ${sizing(2)};
  top: ${sizing(6)};
  opacity: ${p => (p.visible ? 1 : 0)};
  transition: opacity 0.1s linear;
`;

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
  padding: ${sizing(10)} 0;
`;

const SplashText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE};
  color: ${colors.black};
  font-size: ${() => size([4.5, 3])};
  line-height: ${() => size([6, 4.8])};
  margin: ${() => size(2)} 0;
`;

const SectionText = styled(Text)`
  font-family: ${fonts.HELVETICA_NEUE};
  flex-direction: column;
  font-size: ${() => size(2)};
  line-height: ${() => size(3)};
`;

class Splash extends Component {
  static propTypes = {
    history: PropTypes.object,
    actions: PropTypes.object
  };

  state = {
    showJoinButton: false
  };

  onScroll = () => {
    const showJoinButton = window.scrollY > SHOW_FIXED_JOIN_HEIGHT;
    if (this.state.showJoinButton !== showJoinButton) this.setState({ showJoinButton });

    const showFixedLogo = window.scrollY > SHOW_FIXED_LOGO;
    if (this.state.showFixedLogo !== showFixedLogo) this.setState({ showFixedLogo });
  };

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    tween.start();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    tween.stop();
  }

  signUp = async modal => {
    const { actions, history } = this.props;
    history.push('/community/all');
    actions.showModal(modal);
  };

  render() {
    const { showFixedLogo, showJoinButton } = this.state;

    return (
      <View flex={1} fdirection="column" style={{ overflow: 'hidden' }}>
        <Marquee />

        <Wrapper justify="flex-start" align="center" fdirection="column">
          <Section style={{ minHeight: '100vh' }}>
            <Image
              h={[8, 7, 6]}
              mb={6}
              mr={'auto'}
              src={'/img//logo.png'}
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

            <View mt={6} fdirection={'row'} align="center">
              <Button h={8} p={'2 6'} mr={3} onClick={() => this.signUp('signupSocial')}>
                <SectionText>Join Relevant</SectionText>
              </Button>
              <SectionText inline={1}>
                or{' '}
                <Text
                  style={{ textDecoration: 'underline' }}
                  inline={1}
                  onClick={() => this.signUp('login')}
                  c={colors.blue}
                >
                  Log In
                </Text>
              </SectionText>
            </View>
          </Section>

          <Section>
            <SplashText>
              Engagement metrics make it easy to find popular content, but they don’t help
              us determine what’s important, or who we can trust.
            </SplashText>
          </Section>
        </Wrapper>

        <CountUp
          high={['clickbait', 'cat videos']}
          highScore={[700, 1000]}
          low={['climate change', 'decentralization']}
          lowScore={[10, 30]}
          type={'thumb'}
          color={colors.brightRed}
        />

        <Wrapper justify="flex-start" align="center" fdirection="column">
          <Section>
            <SplashText>
              This is why we’ve built a manipulation-resistant Reputation metric that
              allows communities to identify experts and curate content according to its
              value.
            </SplashText>
          </Section>
        </Wrapper>

        <CountUp
          high={['climate change', 'decentralization']}
          highScore={[300, 500]}
          low={['clickbait', 'cat videos']}
          lowScore={[-40, -10]}
          type={'relevant'}
          color={colors.brightBlue}
        />

        <Wrapper justify="flex-start" align="center" fdirection="column">
          <Section>
            <SplashText>
              The Relevant Reputation System puts curation power in the hands of trusted
              community members and experts instead of passive consumers.
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
            <CommunityList p={2} hashtags />
          </Section>

          <Section>
            <SplashText>
              Advertising markets reward popularity. Prediction markets reward expertise.
            </SplashText>
          </Section>
        </Wrapper>

        <CountUp
          high={['a smart post\nwith potential']}
          low={['a not-so-great\nlisticle']}
          type={'coin'}
          color={colors.gold}
        />

        <Wrapper justify="flex-start" align="center" fdirection="column">
          <Section>
            <SplashText>
              On Relevant users can bet on the relevance of content. Bets don’t impact
              rankings but provide a way to reward expert curators.
            </SplashText>
          </Section>

          <View
            mt={4}
            fdirection={['row', 'column']}
            justify={['flex-start', 'center']}
            align={'center'}
            h={['auto', '100vh']}
          >
            <View
              flex={1}
              fdirection={'column'}
              align={['flex-start', 'center']}
              justify={'center'}
              style={{ zIndex: 1 }}
            >
              <Image
                h={[8, 7, 6]}
                src={'/img/logo.png'}
                alt={'Relevant'}
                zIndex={1}
                mt={'auto'}
              />
              <View mt={[8, 'auto']} mb={[0, 6]}>
                <a
                  href="https://itunes.apple.com/us/app/relevant-communities/id1173025051?mt=8"
                  target="_blank"
                >
                  <Image h={[6, 6, 5]} mr={2} src={'/img/appstore.png'} />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.relevantnative&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                  target="_blank"
                >
                  <Image h={[6, 6, 5]} src={'/img/googleplaystore.png'} />
                </a>
              </View>
            </View>
            <Phone
              w={[50, 'auto']}
              h={['auto', '100vh']}
              src={'/img/phone-blank.png'}
              alt={'Relevant Phone'}
            />
          </View>
        </Wrapper>
        <View style={{ position: 'fixed', top: size(5), right: size(1) }}>
          <SocialIcons />
        </View>

        <FixedLogo visible={showFixedLogo}>
          <Image h={[6, 6, 6]} src={'/img/r-big.png'} alt={'Relevant'} />
        </FixedLogo>

        <Join visible={showJoinButton}>
          <Button h={8} p={'2 6'} mr={3} onClick={() => this.signUp('signupSocial')}>
            <SectionText>Join Relevant</SectionText>
          </Button>
        </Join>
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
