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
  parallax: 300,
  speed: 2.15
};

const marqueeSlow = {
  active: true,
  firingRate: 240,
  parallax: 50,
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
    const { high, highScore, low, lowScore } = this.props;
    let { mode, headline, oldScore: score, highIndex, lowIndex } = this.state;
    let marquee;
    mode = !mode;
    if (mode) {
      highIndex += 1;
      headline = high[highIndex % high.length];
      score = randrange(highScore);
      marquee = { ...marqueeFast };
    } else {
      lowIndex += 1;
      headline = low[lowIndex % low.length];
      score = randrange(lowScore);
      marquee = { ...marqueeSlow };
    }
    this.setState({
      mode,
      headline,
      score,
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

  componentDidMount() {
    // this.advance();
  }

  componentWillUnmount() {
    tween.reset();
    clearTimeout(this.timeout);
  }

  render() {
    const { type, color } = this.props;
    const { headline, score, marquee, thumbTiming } = this.state;
    return (
      <CountUpContainer>
        <CountUpMarquee
          type={type}
          score={score}
          onMeasure={this.handleMeasurement.bind(this)}
          {...marquee}
        />
        <CountUpBox
          type={type}
          color={color}
          score={score}
          headline={headline}
          thumbTiming={thumbTiming}
        />
        <CountUpSpacer />
      </CountUpContainer>
    );
  }
}
