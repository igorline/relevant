import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'modules/styled/web';
import styled from 'styled-components';
import { colors, fonts } from 'app/styles';
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
  position: relative;
  overflow: hidden;
  max-height: 550px;
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
              <Text>Curated by communities.</Text>
              <Text>Not clicks.</Text>
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
