import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InlineText, Text, View, Touchable, Button } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, fonts, sizing } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import InviteCta from 'modules/web_splash/inviteCta.component';
import { withRouter } from 'react-router-dom';

const SignUpCta = ({ location }) => (
  <View display="flex" fdirection="row">
    <ULink to={`/user/login?redirect=${location.pathname}`}>
      <Button mr={4}>Login</Button>
    </ULink>
    <ULink to={`/user/signup?redirect=${location.pathname}`}>
      <Button>Sign Up</Button>
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

const Wrapper = styled(View)`
  position: relative;
  overflow: hidden;
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

const Close = styled(View)`
  border-radius: 50;
  width: ${sizing(11)};
  height: ${sizing(11)};
  position: absolute;
  right: ${sizing(3)};
  top: ${sizing(3)};
  z-index: 100;
  cursor: pointer;
`;

if (process.env.BROWSER === true) {
  require('modules/navigation/web/header.css');
}

class Splash extends Component {
  static propTypes = {
    cta: PropTypes.oneOf(Object.keys(CTA)),
    hideCloseButton: PropTypes.bool,
    location: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.onScroll = this.onScroll.bind(this);
  }
  state = {
    isDismissed: false
  };

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    this.setState({ isDismissed: this.checkIfDismissedExpired() });
  }

  checkIfDismissedExpired() {
    if (!window || !window.localStorage || !localStorage) {
      return false;
    }
    const dismissed = localStorage.getItem('splashDismissed');
    if (!dismissed) {
      return false;
    }
    const now = new Date().getTime();
    const diff = Math.abs(now - Number(dismissed));
    const ONE_DAY = 1000 * 60 * 60 * 24;
    if (diff > 5 * ONE_DAY) {
      localStorage.removeItem('splashDismissed');
      return false;
    }
    return true;
  }

  onScroll() {
    if (!this.phone) return;
    this.phone.style.transform = '';
    const top = this.phone.getBoundingClientRect().top - 169;
    const y = Math.max(-top / 3, 0);
    this.phone.style.transform = `translateX(0) translateY(${y}px)`;
  }

  dismiss = () => {
    const now = new Date().getTime();
    localStorage.setItem('splashDismissed', now);
    this.setState({ isDismissed: true });
  };

  render() {
    if (this.state.isDismissed) {
      return null;
    }
    const { cta, hideCloseButton, location } = this.props;
    const img = '/img/hand-transparent.png';
    const learnMoreUrl =
      'https://blog.relevant.community/relevant-curated-by-communities-not-clicks-ba8d346c47da';
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
            <Close bg={colors.blue} display="flex" align="center" justify="center">
              <Text c={colors.white}>CLOSE</Text>
            </Close>
          </Touchable>
        )}
        <View
          className="mainSection"
          m="12 12 0 12"
          flex={1}
          display="flex"
          justify="center"
          align="flex-start"
          direction="column"
        >
          <section className="body">
            <SplashText fs={7} lh={9}>
              <OutlineText inheritfont={1} m={0} p={0}>
                Relevant.
              </OutlineText>{' '}
              <Text>Curated by communities.</Text>
              <Text>Not clicks.</Text>
            </SplashText>
            <View mt={5} mb={8}>
              <SubHeader fs={2.5} lh={4}>
                Join the thought leaders, build trust and earn rewards.{' '}
                <ULink to={learnMoreUrl} display="inline" td="underline">
                  Learn More
                </ULink>
              </SubHeader>
            </View>
          </section>
          {CtaComponent ? (
            <View pb={8}>
              <CtaComponent location={location} />
            </View>
          ) : null}
        </View>
        <View className="phone" flexshrink={1}>
          <img ref={c => (this.phone = c)} src={img} alt="phone" />
        </View>
      </Wrapper>
    );
  }
}

export default withRouter(Splash);
