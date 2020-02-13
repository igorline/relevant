import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { tween } from 'app/utils';
import styled from 'styled-components';
import { Text, BodyText } from 'modules/styled/web';
import { size } from 'app/styles';

import { CountUpContainer, CountUpSpacer } from './countUp.styles';

import CountUpBox from './countUp.box';
import CountUpMarquee from './countUp.animatedEl';
import { ArrowTimer } from './countUp.images';

const BOX_HEIGHT = 26;

const randrange = a => Math.floor(Math.random() * (a[1] - a[0]) + a[0]);

const marqueeCoin = {
  active: true,
  firingRate: 2000,
  parallax: 1,
  speed: 4.5
};

const marqueeOff = {
  active: false,
  firingRate: 0,
  parallax: 0,
  speed: 0
};

const BetResult = styled(Text)`
  position: absolute;
  width: ${() => size([25, 20])};
  height: ${() => size([25, 20])};
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
  opacity: 1;
`;

const BetWin = styled(BetResult)`
  top: ${() => size([-7.5, -8])};
  right: ${() => size([-12, -3])};
  background-image: url(/img/betWin.png);
  transform: rotate(0deg) scale(0);
  ${p =>
    p.show
      ? `
    transition: all .3s cubic-bezier(.83,.42,0,1.24);
    transform:  rotate(23deg) scale(1);
    `
      : ''}
`;
const BetLoose = styled(BetResult)`
  bottom: -60px;
  right: -20px;
  background-image: url(/img/betLoose.png);
  transform: rotate(0deg) scale(0);
  ${p =>
    p.show
      ? `
    transition: all .5s cubic-bezier(.83,.42,0,1.24);
    transform: rotate(-15deg) scale(1);
    `
      : ''}
`;

export default class CountUpCoin extends Component {
  state = {
    mode: false,
    animationState: 0,
    headline: '',
    score: 0,
    highIndex: -1,
    lowIndex: -1,
    marquee: { ...marqueeOff },
    thumbTiming: { delay: 10, duration: 3000 },
    width: global.window ? window.innerWidth / 3 : 0,
    height: 212,
    postRank: 0
  };

  static propTypes = {
    high: PropTypes.array,
    low: PropTypes.array,
    color: PropTypes.string
  };

  componentDidMount() {
    window.addEventListener('blur', this.pause);
  }

  pause = () => {
    clearTimeout(this.timeout);
    window.removeEventListener('focus', this.advance);
    window.addEventListener('focus', this.advance);
  };

  advance = () => {
    const { high, low } = this.props;
    let { mode, highIndex, lowIndex, postRank } = this.state;
    let headline;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
      postRank = randrange([50, 100]);
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
      postRank = randrange([-100, -50]);
    }

    this.setState({
      mode,
      headline,
      highIndex,
      lowIndex,
      animationState: 0,
      postRank
    });
  };

  // window measurement triggers the animation
  handleMeasurement = (width, height) => {
    this.setState({ width, height }, () => this.advance());
  };

  // headline animates first, triggering the coin
  handleHeadlineFinished = () => {
    if (this.state.animationState !== 0) return;
    clearTimeout(this.timeout);
    this.setState({ marquee: marqueeCoin, score: this.state.score + 1 });
  };

  // when coin finishes, increment the score which triggers the timer
  handleCoinFinished = () => {
    this.setState({ marquee: marqueeOff });
  };

  // when the timer is finished, display the funky message!!
  handleTimerFinished = () => {
    this.setState({ animationState: 1 });
    this.timeout = setTimeout(() => {
      this.advance();
    }, 3000);
  };

  componentWillUnmount() {
    window.removeEventListener('blur', this.pause);
    window.removeEventListener('focus', this.advance);
    clearTimeout(this.timeout);
    tween.reset();
  }

  render() {
    const { color } = this.props;
    const {
      mode,
      headline,
      score,
      marquee,
      thumbTiming,
      animationState,
      postRank
    } = this.state;
    const outcome = animationState === 1 && (mode ? 'win' : 'loose');

    return (
      <CountUpContainer>
        <CountUpMarquee
          height={BOX_HEIGHT}
          type={'coin'}
          score={score}
          onMeasure={this.handleMeasurement}
          onFinished={this.handleCoinFinished}
          {...marquee}
        />
        <CountUpBox
          height={BOX_HEIGHT}
          type={'coin'}
          color={color}
          headline={headline}
          onHeadlineFinished={this.handleHeadlineFinished}
        >
          <ArrowTimer
            showRank={animationState === 1}
            score={score}
            postRank={postRank}
            {...thumbTiming}
            onTimerFinished={this.handleTimerFinished}
          />

          <BetWin show={outcome === 'win'}>
            <BodyText p={4} fs={[3, 2.5]} lh={[4, 3]}>
              YOU WIN!
            </BodyText>
          </BetWin>
          <BetLoose show={outcome === 'loose'}>
            <BodyText p={7} fs={[3, 2.5]} lh={[4, 3]}>
              NOT A GREAT BET :(
            </BodyText>
          </BetLoose>
        </CountUpBox>
        <CountUpSpacer flex={[1, null]} w={['auto', 2]} />
      </CountUpContainer>
    );
  }
}
