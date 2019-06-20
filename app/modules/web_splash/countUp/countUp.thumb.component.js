import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { tween } from 'app/utils';

import { CountUpContainer, CountUpSpacer } from './countUp.container';
import CountUpBox from './countUp.box';
import CountUpMarquee from './countUp.marquee';

const marqueeFast = {
  active: true,
  firingRate: 20,
  parallax: 1.3,
  speed: 0.8
};

const marqueeSlow = {
  active: true,
  firingRate: 340,
  parallax: 1.1,
  speed: 3.69
};

const marqueeOff = {
  active: false,
  firingRate: 0,
  parallax: 0,
  speed: 0
};

const marqueeOffTime = 2000;
const marqueeAdvanceTime = 2000;

export default class CountUpThumb extends Component {
  state = {
    mode: false,
    headline: '',
    highIndex: -1,
    lowIndex: -1,
    marquee: { ...marqueeOff },
    thumbTiming: { delay: 0, duration: 2800 },
    width: global.window ? window.innerWidth / 3 : 0,
    height: 212,
    currentScore: 0
  };

  static propTypes = {
    high: PropTypes.array,
    highScore: PropTypes.array,
    low: PropTypes.array,
    lowScore: PropTypes.array,
    type: PropTypes.string,
    color: PropTypes.string
  };

  advance() {
    const { high, low } = this.props;
    let { mode, highIndex, lowIndex } = this.state;
    let headline;
    let marquee;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
      marquee = { ...marqueeFast };
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
      marquee = { ...marqueeSlow };
    }

    const currentScore = 0;

    this.setState({
      mode,
      headline,
      currentScore,
      highIndex,
      lowIndex,
      marquee,
      thumbTiming: {
        delay: marquee.speed * this.state.width,
        duration: 1950
      }
    });

    this.timeout = setTimeout(() => {
      marquee.active = false;
      this.setState({ marquee: marqueeOff });
      this.timeout = setTimeout(() => {
        this.advance();
      }, marqueeAdvanceTime);
    }, marqueeOffTime);
  }

  handleMeasurement(width, height) {
    this.setState({ width, height }, () => this.advance());
  }

  handleFinished(score) {
    this.setState({ currentScore: this.state.currentScore + score });
  }

  componentWillUnmount() {
    tween.reset();
    clearTimeout(this.timeout);
  }

  render() {
    const { color } = this.props;
    const { headline, currentScore, marquee, thumbTiming } = this.state;
    return (
      <CountUpContainer>
        <CountUpMarquee
          type={'thumb'}
          score={currentScore}
          onMeasure={this.handleMeasurement.bind(this)}
          onFinished={this.handleFinished.bind(this)}
          {...marquee}
        />
        <CountUpBox
          type={'thumb'}
          color={color}
          score={currentScore}
          headline={headline}
          thumbTiming={thumbTiming}
        />
        <CountUpSpacer />
      </CountUpContainer>
    );
  }
}
