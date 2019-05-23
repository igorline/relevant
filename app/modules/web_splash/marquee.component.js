import React, { Component } from 'react';
import styled from 'styled-components';
import { View, Text, NumericalValue } from 'modules/styled/web';
import { colors } from 'app/styles';
import { data } from './marquee.data';

const MarqueeContainer = styled(View)`
  white-space: nowrap;
  width: 100vw;
  overflow: hidden;
  z-index: 1;
`;

const BG_COLORS = [colors.black, colors.white];

export default class Marquee extends Component {
  x = {
    0: 0,
    1: 0,
    2: 0
  };

  marqueeData = data;

  dataBlock = {};

  innerEls = {};

  widths = [];

  iteration = 0;

  // strips = 3;

  componentDidMount() {
    this.renderMarquee(true);
    // this.strips = this.props.strips || this.strips;
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.lastFrame);
  }

  animate = () => {
    const now = new Date();

    let elapsed = 0;
    if (this.lastTime) elapsed = now - this.lastTime;
    elapsed /= 10;

    this.x = [
      (this.x[0] -= 0.5 * elapsed),
      (this.x[1] -= 0.8 * elapsed),
      (this.x[2] -= 0.65 * elapsed)
    ];
    this.x = this.x.map((x, i) => {
      const w = this.dataBlock[i].offsetWidth / 2;
      // const w = document.getElementsByClassName('m' + i)[0].offsetWidth / 2;
      if (x <= -w) x += w;
      const rX = Math.round(x * 100) / 100;
      this.dataBlock[i].style.transform = 'translateX(' + rX + 'px) translateZ(0px)';
      return x;
    });

    this.lastTime = now;
    this.lastFrame = window.requestAnimationFrame(() => this.animate());
  };

  renderMarquee = initial => {
    if (!this.marqueeData) return;
    this.marqueeData.forEach((d, i) => {
      if (initial) this.innerEls[i] = [];
      d.forEach((innerData, j) => {
        const color = BG_COLORS[(i + 1) % 2];
        const sign = innerData.change;
        const userData = (
          <React.Fragment>
            <Text mr={0.5} c={color}>
              {innerData.name.toUpperCase()}
            </Text>
            <Text mr={0.5} c={sign < 0 ? colors.red : colors.green}>
              {sign >= 0 ? '▲' : '▼'}
            </Text>
            <Text c={color}>{innerData.change}% </Text>
          </React.Fragment>
        );
        const specialKey =
          JSON.stringify(j) + JSON.stringify(i) + JSON.stringify(this.iteration);
        const singleEl = (
          <NumericalValue p={'1 4'} key={specialKey}>
            {userData}
          </NumericalValue>
        );
        this.innerEls[i].push(singleEl);
      });
    });
    this.setState({});
    this.iteration++;
    if (initial) {
      this.animate();
      this.renderMarquee();
    }
  };

  renderStrip = i => {
    const bg = BG_COLORS[i % 2];
    return (
      <View fdirection="row" flex={1} bg={bg}>
        <Text
          className={`m${i}`}
          style={{ transform: `translateX(${this.x[i]}px)` }}
          ref={c => (this.dataBlock[i] = c)}
        >
          {this.innerEls[i]}
        </Text>
      </View>
    );
  };

  render() {
    return (
      <MarqueeContainer fdirection="column">
        {[0, 1, 2].map(this.renderStrip)}
      </MarqueeContainer>
    );
  }
}
