import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { tween } from 'app/utils';

import { CountUpContainer, CountUpSpacer } from './countUp.styles';

import CountUpBox from './countUp.box';
import AnimatedEl from './countUp.animatedEl';
import { BigThumb, Arrows } from './countUp.images';

const BOX_HEIGHT = 26;

const animationParams = {
  good: {
    relevant: {
      active: true,
      firingRate: 100,
      parallax: 1.3,
      speed: 5
    },
    thumb: {
      active: true,
      firingRate: 340,
      parallax: 1.1,
      speed: 3.69
    }
  },
  bad: {
    relevant: {
      active: true,
      firingRate: 300,
      parallax: 1.3,
      speed: 5
    },
    thumb: {
      active: true,
      firingRate: 20,
      parallax: 1.3,
      speed: 0.8
    }
  },
  off: {
    active: false,
    firingRate: 0,
    parallax: 0,
    speed: 0
  }
};

const marqueeOffTime = 2000;
const marqueeAdvanceTime = 2000;

export default class CountUp extends Component {
  static propTypes = {
    high: PropTypes.array,
    highScore: PropTypes.array,
    low: PropTypes.array,
    lowScore: PropTypes.array,
    color: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    mode: false,
    headline: '',
    score: 0,
    highIndex: -1,
    lowIndex: -1,
    marquee: animationParams.off,
    thumbTiming: { delay: 0, duration: 2800 },
    width: global.window ? window.innerWidth / 3 : 0
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
    const { high, low, type } = this.props;
    let { mode, highIndex, lowIndex } = this.state;
    let headline;
    let marquee;
    let score;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
      score = 100;
      marquee = { ...animationParams.bad[type] };
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
      score = -100;
      marquee = { ...animationParams.good[type] };
    }

    const currentScore = 0;

    this.setState({
      mode,
      headline,
      score,
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
      this.setState({ marquee: animationParams.off });
      this.timeout = setTimeout(() => {
        this.advance();
      }, marqueeAdvanceTime);
    }, marqueeOffTime);
  };

  handleMeasurement(width) {
    this.setState({ width }, () => this.advance());
  }

  handleFinished(score) {
    this.setState({ currentScore: this.state.currentScore + score });
  }

  componentWillUnmount() {
    tween.reset();
    clearTimeout(this.timeout);
    window.removeEventListener('blur', this.pause);
    window.removeEventListener('focus', this.advance);
  }

  render() {
    const { color, type } = this.props;
    const { headline, mode, currentScore, marquee, thumbTiming } = this.state;
    return (
      <CountUpContainer>
        <AnimatedEl
          height={BOX_HEIGHT}
          type={type}
          mode={mode}
          onMeasure={this.handleMeasurement.bind(this)}
          onFinished={this.handleFinished.bind(this)}
          {...marquee}
        />
        <CountUpBox
          height={BOX_HEIGHT}
          type={type}
          color={color}
          score={currentScore}
          headline={headline}
          thumbTiming={thumbTiming}
        >
          {type === 'thumb' ? (
            <BigThumb score={currentScore} {...thumbTiming} />
          ) : (
            <Arrows score={currentScore} {...thumbTiming} />
          )}
        </CountUpBox>
        <CountUpSpacer flex={[1, null]} w={['auto', 2]} />
      </CountUpContainer>
    );
  }
}
