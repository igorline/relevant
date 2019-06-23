import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Text, View, Image, Button, BodyText, Video } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts, sizing, size, responsive } from 'app/styles';
import { tween } from 'app/utils';
import * as navigationActions from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import CommunityList from 'modules/community/communityList.component';
import SocialIcons from 'modules/navigation/social.icons';
import { getCommunities } from 'modules/community/community.actions';
import Marquee from './post.marquee';
import CountUp from './countUp/countUp.component';
import CountUpCoin from './countUp/countUp.coin.component';

const SHOW_FIXED_JOIN_HEIGHT = 250;
const SHOW_FIXED_LOGO = 500;
const VID_RATIO = 2.167042889390519;
const VID_TO_PHONE = 0.85;

const ImageLabel = styled(BodyText)`
  margin: ${sizing(1)} auto;
  text-align: center;
  padding: 0 ${sizing(2)};
`;

const PhoneVideo = styled(Video)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
`;

const Phone = styled(View)`
  position: ${() => responsive(['relative', 'absolute'])};
  bottom: ${() => responsive(['auto', size(6)])};
  right: ${() => responsive(['auto', '-20vw'])};
  opacity: ${() => responsive([1, 0.5])};
  transform: rotate(-2.82deg);
`;

const Join = styled(View)`
  position: fixed;
  left: 50%;
  transform: translate3d(-50%, ${p => (p.visible ? '0px' : '200px')}, 0);
  transition: transform 0.3s ease-in;
  bottom: ${sizing(4)};
  z-index: 1000;
`;

const Social = styled(View)`
  top: ${() => size([4, 'auto'])};
  right: ${() => size([1, 'auto'])};
  align-self: 'center';
  position: ${() => responsive(['fixed', 'relative'])};
  justify-content: center;
`;

const FixedLogo = styled(View)`
  position: fixed;
  left: ${sizing(2)};
  top: ${sizing(4)};
  opacity: ${p => (p.visible ? 1 : 0)};
  transition: opacity 0.1s linear;
`;

const Section = styled(View)`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding: ${sizing(6)};
  padding-left: ${sizing(2)};
  padding-right: ${sizing(2)};
  max-width: ${sizing(75)};
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

  static fetchData(dispatch) {
    return dispatch(getCommunities());
  }

  onScroll = () => {
    const showJoinButton =
      document.body.scrollHeight - window.innerHeight - window.scrollY <
      SHOW_FIXED_JOIN_HEIGHT;
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

    const sectionSpace = 12;

    return (
      <View flex={1} fdirection="column" style={{ overflow: 'hidden' }}>
        <Marquee />

        <Section minHeight={'100vh'}>
          <Image
            mt={[0, 6]}
            h={[8, 7, 6]}
            mb={[6, 4]}
            mr={'auto'}
            ml={[0, 'auto']}
            src={'/img//logo.png'}
            alt={'Relevant'}
          />
          <SplashText>
            Tired of the social media
            <br />
            popularity game?
          </SplashText>
          <SplashText inline={1} mt={6}>
            Join a <ULink to="/community/all">Relevant Community</ULink> and get rewarded
            for your expertise.
          </SplashText>

          <View mt={6} fdirection={['row', 'column']} align="center">
            <Button
              h={8}
              p={'2 6'}
              mr={[3, 0]}
              onClick={() => this.signUp('signupSocial')}
              alignself={['flex-start', 'stretch']}
            >
              <SectionText>Join Relevant</SectionText>
            </Button>
            <SectionText mt={[0, 2]} inline={1}>
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

        <Section pt={sectionSpace}>
          <SplashText>
            Engagement metrics make it easy to find popular content, but they don’t help
            us determine what’s important, or who we can trust.
          </SplashText>
        </Section>

        <CountUp
          high={['clickbait', 'cat videos']}
          highScore={[700, 1000]}
          low={['climate change study', 'a nuanced opinion']}
          lowScore={[10, 30]}
          type={'thumb'}
          color={colors.darkLightGrey}
        />
        <ImageLabel>Web 2.0 metrics controlled by mobs and bots</ImageLabel>

        <Section pt={sectionSpace}>
          <SplashText>
            That’s why we created Relevant, a manipulation-resistant social network that
            filters content according to quality, not clicks.
          </SplashText>
        </Section>

        <CountUp
          high={['climate change study', 'a nuanced opinion']}
          highScore={[300, 500]}
          low={['clickbait', 'cat videos']}
          lowScore={[-40, -10]}
          type={'relevant'}
          color={colors.blue}
        />
        <ImageLabel>Votes from users with high Reputation count for more</ImageLabel>

        <Section mt={2}>
          <SplashText>
            The Relevant Reputation System puts curation power in the hands of trusted
            community members instead of passive consumers.
          </SplashText>
        </Section>

        <Section pt={sectionSpace}>
          <SplashText>Relevant rewards users for curating content.</SplashText>
        </Section>

        <CountUpCoin
          high={['climate change study', 'a nuanced opinion']}
          low={['clickbait', 'cat videos']}
          type={'coin'}
          color={colors.gold}
        />

        <Section>
          <SplashText>
            Users can earn coins by betting on the relevance of content. Bets don’t impact
            rankings but provide a way to reward users for their expertise.
          </SplashText>
        </Section>

        <Section pt={sectionSpace}>
          <SplashText>
            Each Relevant Community has its own unique Reputation System. Communities
            decide what kind of information is valuable to them and how that value is
            measured.
          </SplashText>
          <SplashText>Here are a few communities you can join right now:</SplashText>
          <CommunityList p={2} hashtags />
        </Section>

        <View
          margin={'auto'}
          flex={[1, null]}
          mt={4}
          fdirection={['row', 'column']}
          justify={['center', 'space-between']}
          align={'center'}
          h={['auto', '100vh']}
          mb={[0, 0]}
        >
          <View
            fdirection={'column'}
            align={['flex-start', 'center']}
            justify={'center'}
            style={{ zIndex: 1 }}
            flex={[0, 1]}
          >
            <View flex={1} align={'center'}>
              <Image
                h={[8, 0]}
                src={'/img/logo.png'}
                alt={'Relevant'}
                zIndex={1}
                mt={'auto'}
              />
            </View>
            <View mt={[8, 4]} mb={[0, 1]}>
              <a
                href="https://itunes.apple.com/us/app/relevant-communities/id1173025051?mt=8"
                target="_blank"
              >
                <Image h={[6, 6, 5]} mr={[2, 1]} src={'/img/appstore.png'} />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.relevantnative&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                target="_blank"
              >
                <Image h={[6, 6, 5]} src={'/img/googleplaystore.png'} />
              </a>
            </View>

            <Social>
              <SocialIcons />
            </Social>
          </View>
          <Phone ml={3} justify={'center'} align={'center'}>
            <PhoneVideo
              w={[VID_TO_PHONE * 50, 'auto']}
              h={[VID_TO_PHONE * 50 * VID_RATIO, `${VID_TO_PHONE * 100}vh`]}
              src={'img/vid.webm'}
              autoPlay
              loop
            />
            <Image
              w={[50, 'auto']}
              h={['auto', '100vh']}
              src={'/img/Phone-blank.png'}
              alt={'Relevant Phone'}
            />
          </Phone>
        </View>

        <FixedLogo mt={[2, 1]} visible={showFixedLogo}>
          <Image h={[6, 4, 3]} src={'/img/r-big.png'} alt={'Relevant'} />
        </FixedLogo>

        <Join w={['auto', '100%']} mb={[0, 12]} p={[0, '0 2']} visible={showJoinButton}>
          <Button flex={1} h={8} p={'2 6'} onClick={() => this.signUp('signupSocial')}>
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
