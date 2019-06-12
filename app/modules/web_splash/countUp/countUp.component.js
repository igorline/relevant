import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { tween } from 'app/utils';

import CountUpBox from './countUp.box';
import CountUpMarquee from './countUp.marquee';

const randrange = a => Math.floor(Math.random() * (a[1] - a[0]) + a[0]);

const CountUpContainer = styled(View)`
  flex: 1;
  justify-content: flex-start;
  flex-direction: row;
  align-items: flex-start;
`;

const CountUpSpacer = styled(View)`
  flex: 1;
`;

const marqueeFast = {
  active: true,
  firingRate: 80,
  parallax: 150,
  speed: 2.15
};

const marqueeSlow = {
  active: true,
  firingRate: 240,
  parallax: 80,
  speed: 2.69
};

const marqueeSlowRelevant = {
  active: true,
  firingRate: 180,
  parallax: 150,
  speed: 2.69
};

const marqueeOff = {
  active: false,
  firingRate: 0,
  parallax: 0,
  speed: 0
};

const marqueeOffTime = 2000;
const marqueeAdvanceTime = 2000;

export default class CountUp extends Component {
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
    highScore: PropTypes.array,
    low: PropTypes.array,
    lowScore: PropTypes.array,
    type: PropTypes.string,
    color: PropTypes.string
  };

  advance() {
    const { type, high, highScore, low, lowScore } = this.props;
    let { mode, headline, oldScore: score, highIndex, lowIndex } = this.state;
    let marquee;
    let currentScore;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
      score = highScore && randrange(highScore);
      marquee = { ...marqueeFast };
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
      score = lowScore && randrange(lowScore);
      marquee = { ...(type === 'relevant' ? marqueeSlowRelevant : marqueeSlow) };
    }
    switch (type) {
      case 'relevant':
        currentScore = 0;
        break;
      default:
        currentScore = score;
        break;
    }
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
      case 'bet':
        break;
      default:
        break;
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
          thumbTiming={thumbTiming}
        />
        <CountUpSpacer />
      </CountUpContainer>
    );
  }
}
