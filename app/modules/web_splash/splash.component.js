import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InlineText, Text, View, Touchable, Button, CloseX } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, fonts } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import InviteCta from 'modules/web_splash/inviteCta.component';
import { withRouter } from 'react-router-dom';
import { storage } from 'utils';

const SignUpCta = ({ location }) => (
  <View display="flex" fdirection="row" justify={['flex-start']}>
    <ULink to={`/user/login?redirect=${location.pathname}`}>
      <Button mr={4}>Login</Button>
    </ULink>
    <ULink to={`/user/signup?redirect=${location.pathname}`}>
      <Button mr={0}>Sign Up</Button>
    </ULink>
  </View>
);

SignUpCta.propTypes = {
  location: PropTypes.object
};

const CTA = {
  INVITE: InviteCta,
  SIGN_UP: SignUpCta
};

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
  ${p => (p.screenSize ? mobilePhone : '')}
`;

const Wrapper = styled(View)`
  position: relative;
  overflow: hidden;
  max-height: 550px;
`;

const SplashText = styled(InlineText)`
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

class Splash extends Component {
  static propTypes = {
    cta: PropTypes.oneOf(Object.keys(CTA)),
    hideCloseButton: PropTypes.bool,
    location: PropTypes.object,
    screenSize: PropTypes.number,
    overRideDismiss: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }
  state = {
    isDismissed: true
  };

  componentDidMount = async () => {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll;
    const isDismissed = await storage.isDismissed('splashDismissed', 5);
    this.setState({
      isDismissed
    });
  };

  onScroll() {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  dismiss = () => {
    const now = new Date().getTime();
    storage.set('splashDismissed', now);
    this.setState({ isDismissed: true });
  };

  render() {
    const { cta, hideCloseButton, location, screenSize, overRideDismiss } = this.props;

    if (this.state.isDismissed && !overRideDismiss) {
      return null;
    }

    const img = '/img/hand-transparent.png';
    const learnMoreUrl =
      'https://blog.relevant.community/relevant-beta-is-live-c385d0e1286c';
    const CtaComponent = CTA[cta];
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
        {hideCloseButton ? null : (
          <Touchable onPress={this.dismiss}>
            <CloseX
              w={3}
              h={3}
              top={[6, 3]}
              right={[6, 3]}
              resizeMode={'contain'}
              source={require('app/public/img/x.png')}
            />
          </Touchable>
        )}
        <View
          className="mainSection"
          m={['12 12 0 12', '4 2 0 2']}
          flex={1}
          justify="center"
          align={['flex-start', 'stretch']}
          fdirection="column"
        >
          <View>
            <SplashText fs={[6, 3]} lh={[9, 4.2]}>
              <OutlineText inheritfont={1} m={0} p={0}>
                Relevant.
              </OutlineText>{' '}
              <Text>A new kind of social network built on trust.</Text>
            </SplashText>
            <View mt={[5, 2]} mb={[8, 4]}>
              <SubHeader fs={[2.5, 1.5]} lh={[4, 3]}>
                Join a community, curate content and earn rewards.{' '}
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
          {CtaComponent ? (
            <View pb={[8, 4]}>
              <CtaComponent location={location} />
            </View>
          ) : null}
        </View>
        <Phone screenSize={screenSize} className="phone" flexshrink={[1, 0]}>
          <img
            style={{ width: '100%' }}
            ref={c => (this.phone = c)}
            src={img}
            alt="phone"
          />
        </Phone>
      </Wrapper>
    );
  }
}

export default withRouter(Splash);
