import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { tween } from 'app/utils';

import { CountUpContainer, CountUpSpacer } from './countUp.container';

import CountUpBox from './countUp.box';
import CountUpMarquee from './countUp.marquee';

const marqueeCoin = {
  active: true,
  firingRate: 2000,
  parallax: 2.2,
  speed: 6
};

const marqueeOff = {
  active: false,
  firingRate: 0,
  parallax: 0,
  speed: 0
};

const marqueeOffTime = 2000;
const marqueeAdvanceTime = 2000;

export default class CountUpCoin extends Component {
  state = {
    mode: false,
    headline: '',
    score: 0,
    highIndex: -1,
    lowIndex: -1,
    marquee: { ...marqueeOff },
    thumbTiming: { delay: 0, duration: 2800 },
    width: window.innerWidth / 3,
    height: 212
  };

  static propTypes = {
    high: PropTypes.array,
    low: PropTypes.array,
    type: PropTypes.string,
    color: PropTypes.string
  };

  advance() {
    const { high, low } = this.props;
    let { mode, highIndex, lowIndex } = this.state;
    const { score: oldScore } = this.state;
    let headline;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
    }

    const marquee = { ...marqueeCoin };
    const currentScore = oldScore;
    const score = oldScore;

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
    switch (this.props.type) {
      case 'relevant':
        this.setState({ currentScore: this.state.currentScore + score });
        break;
      case 'coin':
        this.setState({ currentScore: this.state.currentScore + 1 });
        break;
      default:
        break;
    }
  }

  handleHeadlineFinished() {
    if (this.props.type === 'coin') {
      this.setState({ score: this.state.score + 1 });
    }
  }

  handleTimerFinished() {
    if (this.props.type === 'coin') {
      // console.log('wooooooo');
    }
  }

  componentDidMount() {
    // this.advance();
  }

  componentWillUnmount() {
    tween.reset();
    clearTimeout(this.timeout);
  }

  render() {
    const { type, color } = this.props;
    const { headline, score, currentScore, marquee, thumbTiming } = this.state;
    return (
      <CountUpContainer>
        <CountUpMarquee
          type={type}
          score={score}
          onMeasure={this.handleMeasurement.bind(this)}
          onFinished={this.handleFinished.bind(this)}
          {...marquee}
        />
        <CountUpBox
          type={type}
          color={color}
          score={currentScore}
          headline={headline}
          onHeadlineFinished={this.handleHeadlineFinished.bind(this)}
          thumbTiming={thumbTiming}
          onTimerFinished={this.handleTimerFinished.bind(this)}
        />
        <CountUpSpacer />
      </CountUpContainer>
    );
  }
}
