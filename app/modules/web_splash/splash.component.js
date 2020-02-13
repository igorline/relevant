import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { InlineText, Text, View, Touchable, Button, CloseX } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors, fonts } from 'app/styles';
import ULink from 'modules/navigation/ULink.component';
import { withRouter } from 'react-router-dom';
import { storage } from 'utils';
import { showModal } from 'modules/navigation/navigation.actions';

const SignUpCta = ({ location, history }) => {
  const dispatch = useDispatch();
  const setRedirect = () => history.replace({ search: `?redirect=${location.pathname}` });

  return (
    <View display="flex" fdirection="row" justify={['flex-start']}>
      <Button
        onPress={() => {
          setRedirect();
          dispatch(showModal('login'));
        }}
        mr={4}
      >
        Login
      </Button>
      <Button
        onPress={() => {
          setRedirect();
          dispatch(showModal('signupSocial'));
        }}
        mr={0}
      >
        Sign Up
      </Button>
    </View>
  );
};

SignUpCta.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
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

const SubHeader = styled(Text)`
  font-family: ${fonts.GEORGIA};
  display: inline;
`;

class Splash extends Component {
  static propTypes = {
    hideCloseButton: PropTypes.bool,
    location: PropTypes.object,
    history: PropTypes.object,
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
    const isDismissed = await storage.isDismissed('splashDismissed', 5);
    this.setState({
      isDismissed
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isDismissed !== this.state.isDismissed) {
      this.onScroll();
    }
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
    storage.set('splashDismissed', now);
    this.setState({ isDismissed: true });
  };

  render() {
    const {
      hideCloseButton,
      location,
      history,
      screenSize,
      overRideDismiss
    } = this.props;

    if (this.state.isDismissed && !overRideDismiss) {
      return null;
    }

    const img = '/img/hand-transparent.png';
    const learnMoreUrl =
      'https://blog.relevant.community/relevant-curated-by-communities-not-clicks-ba8d346c47da';

    return (
      <Wrapper
        ref={c => (this.container = c)}
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
              top={[6, 4]}
              right={[6, 3]}
              resizeMode={'contain'}
              source={require('app/public/img/x.png')}
            />
          </Touchable>
        )}
        <View
          m={['12 12 0 12', '3 8 0 2']}
          flex={1}
          justify="center"
          align={['flex-start', 'stretch']}
          fdirection="column"
        >
          <View>
            <SplashText fs={[6, 3]} lh={[9, 4.2]}>
              {/* <OutlineText inheritfont={1} m={0} p={0}>
                Relevant.
              </OutlineText>{' '} */}
              <Text>A new kind of social network built on trust.</Text>
            </SplashText>
            <View mt={[5, 2]} mb={[8, 2]}>
              <SubHeader fs={[2.5, 1.5]} lh={[4, 3]}>
                Join a <ULink to="/communities">community</ULink>, curate content and earn
                rewards.{' '}
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
          {SignUpCta ? (
            <View pb={[8, 3]}>
              <SignUpCta location={location} history={history} />
            </View>
          ) : null}
        </View>
        <Phone screenSize={screenSize} flexshrink={[1, 0]}>
          <img
            style={{ width: '100%' }}
            ref={c => (this.phone = c)}
            onLoad={this.onScroll}
            src={img}
            alt="phone"
          />
        </Phone>
      </Wrapper>
    );
  }
}

export default withRouter(Splash);
