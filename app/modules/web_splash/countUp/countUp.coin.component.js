import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { tween } from 'app/utils';

import { CountUpContainer, CountUpSpacer } from './countUp.container';

import CountUpBox from './countUp.box';
import CountUpMarquee from './countUp.marquee';

const marqueeCoin = {
  active: true,
  firingRate: 2000,
  parallax: 1,
  speed: 5.5
};

const marqueeOff = {
  active: false,
  firingRate: 0,
  parallax: 0,
  speed: 0
};

export default class CountUpCoin extends Component {
  state = {
    mode: false,
    animationState: 0,
    headline: '',
    score: 0,
    highIndex: -1,
    lowIndex: -1,
    marquee: { ...marqueeOff },
    thumbTiming: { delay: 0, duration: 1000 },
    width: global.window ? window.innerWidth / 3 : 0,
    height: 212
  };

  static propTypes = {
    high: PropTypes.array,
    low: PropTypes.array,
    color: PropTypes.string
  };

  advance() {
    const { high, low } = this.props;
    let { mode, highIndex, lowIndex } = this.state;
    let headline;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
    }

    this.setState({
      mode,
      headline,
      highIndex,
      lowIndex,
      animationState: 0
    });
  }

  // window measurement triggers the animation
  handleMeasurement(width, height) {
    this.setState({ width, height }, () => this.advance());
  }

  // headline animates first, triggering the coin
  handleHeadlineFinished() {
    if (this.state.animationState !== 0) return;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({ marquee: marqueeCoin, animationState: 1 });
      this.timeout = setTimeout(() => {
        this.setState({ marquee: marqueeOff, animationState: 2 });
      }, 20);
    }, 500);
  }

  // when coin finishes, increment the score which triggers the timer
  handleCoinFinished() {
    if (this.state.animationState !== 2) return;
    this.setState({ score: this.state.score + 1, animationState: 3 });
  }

  // when the timer is finished, display the funky message!!
  handleTimerFinished() {
    if (this.state.animationState !== 3) return;
    this.setState({ animationState: 4 });

    setTimeout(() => {
      this.advance();
    }, 3000);
  }

  componentWillUnmount() {
    tween.reset();
    clearTimeout(this.timeout);
  }

  render() {
    const { color } = this.props;
    const { mode, headline, score, marquee, thumbTiming, animationState } = this.state;

    return (
      <CountUpContainer>
        <CountUpMarquee
          type={'coin'}
          score={score}
          onMeasure={this.handleMeasurement.bind(this)}
          onFinished={this.handleCoinFinished.bind(this)}
          {...marquee}
        />
        <CountUpBox
          type={'coin'}
          color={color}
          score={score}
          headline={headline}
          onHeadlineFinished={this.handleHeadlineFinished.bind(this)}
          thumbTiming={thumbTiming}
          onTimerFinished={this.handleTimerFinished.bind(this)}
          outcome={animationState === 4 && (mode ? 'win' : 'loose')}
        />
        <CountUpSpacer />
      </CountUpContainer>
    );
  }
}
