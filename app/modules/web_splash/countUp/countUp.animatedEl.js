import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { Thumb, Arrow, Coin } from './countUp.images';

const randfloat = n => Math.random() * n;
const randint = n => Math.floor(Math.random() * n);

const CountUpMarqueeContainer = styled(View)`
  flex: 1;
  overflow: hidden;
  max-width: ${sizing(30)};
`;

// const LeftGradient = styled(View)`
//   background: linear-gradient(0.25turn, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
//   width: 80%;
//   height: 100%;
//   position: absolute;
//   top: 0;
//   left: 0;
// `;

export default class CountUpMarquee extends PureComponent {
  state = {
    index: 0
  };

  static propTypes = {
    type: PropTypes.string,
    active: PropTypes.bool,
    firingRate: PropTypes.number,
    parallax: PropTypes.number,
    speed: PropTypes.number,
    onMeasure: PropTypes.func,
    onFinished: PropTypes.func,
    score: PropTypes.number,
    mode: PropTypes.bool,
    height: PropTypes.number
  };

  container = React.createRef();

  index = 0;

  thumbs = Array.from({ length: 20 }, React.createRef);

  arrowTypes = Array.from({ length: 20 }, () => ({
    up: Math.random() > 0.5,
    big: Math.random() > 0.2
  }));

  componentDidMount() {
    this.animate(0);
    this.thumbs.forEach(el => {
      el.current.style.transform = 'translate3D(' + [10, 0, 0].join('px,') + 'px)';
    });
    this.props.onMeasure(
      this.container.current.offsetWidth,
      this.container.current.offsetHeight
    );
    window.addEventListener('blur', this.pause);
  }

  componentWillUnmount() {
    window.removeEventListener('blur', this.pause);
    window.removeEventListener('focus', this.animate);
    clearTimeout(this.timeout);
  }

  pause = () => {
    clearTimeout(this.timeout);
    window.removeEventListener('focus', this.animate);
    window.addEventListener('focus', this.animate);
  };

  animate = ({ index = 0 }) => {
    const { active, firingRate } = this.props;
    if (active) {
      this.timeout = setTimeout(() => this.animate({ index: index + 1 }), firingRate);
      this.add(index);
      this.setState({ index });
    } else {
      this.timeout = setTimeout(() => this.animate({ index }), 100);
    }
  };

  add = index => {
    const { parallax, speed, mode, type, onFinished } = this.props;
    const width = this.container.current.offsetWidth;
    const height = this.container.current.offsetHeight;

    const duration = width * speed;

    let y;
    let elScore = 1;

    const modIndex = index % this.thumbs.length;
    const el = this.thumbs[modIndex];
    let elHeight = el.current.offsetHeight;
    this.arrowTypes[modIndex] = {};
    const arrowType = this.arrowTypes[modIndex];
    let targetY;
    let startX = 0;

    switch (type) {
      case 'relevant':
        if (mode) {
          arrowType.big = Math.random() < 0.7;
          arrowType.up = arrowType.big ? Math.random() < 0.9 : Math.random() < 0.2;
        } else {
          arrowType.big = Math.random() < 0.3;
          arrowType.up = arrowType.big ? Math.random() < 0.1 : Math.random() < 0.8;
        }

        elScore = arrowType.big ? randint(10) + 10 : 1;
        if (!arrowType.up) elScore *= -1;

        elHeight = arrowType.big ? 70 : 25;
        startX = randfloat(20);

        y = randint(height - elHeight);
        targetY = arrowType.up ? 0 : height - elHeight;
        break;
      case 'thumb':
        targetY = (height - elHeight) / 2;
        y = randint(height - elHeight);
        break;
      default:
        y = (height - elHeight) / 2;
        targetY = y;
        break;
    }

    if (!el || !el.current || !y) return;

    const tween1 = () =>
      tween.add({
        from: { scale: 0 },
        to: { scale: 1 },
        duration: 200,
        update: ({ scale }) => {
          el.current.style.transform = `translate3D(${-width +
            startX}px, ${y}px, 0) scale(${scale}) `;
        },
        easing: tween.easing.cubic_bezier(0.83, 0.42, 0, 1.24),
        finished: () => tween2()
      });

    const tween2 = () =>
      tween.add({
        from: { x: -width + startX, y },
        to: { x: 0, y: targetY },
        duration: duration + randfloat(parallax),
        easing: tween.easing.circ_in,
        update: ({ x, y: tY }) => {
          el.current.style.transform = `translate3D(${x.toFixed(1)}px, ${tY || y}px, 0)`;
        },
        finished: () => {
          el.current.style.transform = `translate3D(${50}px, ${y}px, 0)`;
          if (onFinished) onFinished(elScore);
        }
      });
    tween1();
  };

  render() {
    const { type, height } = this.props;
    let thumbs;
    switch (type) {
      case 'thumb':
        thumbs = this.thumbs.map((ref, i) => <Thumb ref={ref} key={i} />);
        break;
      case 'coin':
        thumbs = this.thumbs.map((ref, i) => <Coin ref={ref} key={i} />);
        break;
      default:
        thumbs = this.thumbs.map((ref, i) => (
          <Arrow ref={ref} key={i} {...this.arrowTypes[i]} />
        ));
        break;
    }
    return (
      <CountUpMarqueeContainer h={height} ref={this.container}>
        {thumbs}
        {/* <LeftGradient /> */}
      </CountUpMarqueeContainer>
    );
  }
}
