import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { Thumb, Arrow } from './countUp.images';

const randint = n => Math.floor(Math.random() * n);

const CountUpMarqueeContainer = styled(View)`
  flex: 1;
  height: ${sizing(30)};
  overflow: hidden;
`;

const LeftGradient = styled(View)`
  background: linear-gradient(0.25turn, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  width: 50%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

export default class CountUpMarquee extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    active: PropTypes.bool,
    firingRate: PropTypes.number,
    parallax: PropTypes.number,
    speed: PropTypes.number,
    onMeasure: PropTypes.func,
    score: PropTypes.number
  };

  constructor() {
    super();
    this.index = 0;
    this.thumbs = [];
    this.arrowTypes = [];
    for (let i = 0; i < 20; i++) {
      this.thumbs.push(React.createRef());
      this.arrowTypes.push({ up: Math.random() > 0.5, big: Math.random() > 0.2 });
    }
    this.container = React.createRef();
  }

  componentDidMount() {
    this.animate(0);
    this.thumbs.forEach(el => {
      el.current.style.transform = 'translate3D(' + [-50, 0, 0].join('px,') + 'px)';
    });
    this.props.onMeasure(
      this.container.current.offsetWidth,
      this.container.current.offsetHeight
    );
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  animate(index) {
    const { active, firingRate } = this.props;
    if (active) {
      this.timeout = setTimeout(() => this.animate(index + 1), firingRate);
      this.add(index);
    } else {
      this.timeout = setTimeout(() => this.animate(index), 100);
    }
  }

  add(index) {
    let { parallax } = this.props;
    const { speed, score, type } = this.props;
    const width = this.container.current.offsetWidth;
    const duration = width * speed;
    let height = this.container.current.offsetHeight;
    let y;
    if (type === 'thumb') {
      height = (height - 100) / 2;
      y = randint(height) + (index % 2) * (height + 50);
    } else {
      parallax *= 1.5;
      height = (height - 100) / 2;
      y = randint(height) + (index % 2) * (height + 30);
    }
    const modIndex = index % this.thumbs.length;
    const el = this.thumbs[modIndex];
    if (!el || !el.current || !y) return;
    tween.add({
      from: { x: -50 },
      to: { x: width },
      duration: duration + parallax,
      easing: tween.easing.circOut,
      update: ({ x }) => {
        el.current.style.transform =
          'translate3D(' + [x.toFixed(1), y, 0].join('px,') + 'px)';
      },
      finished: () => {
        el.current.style.transform = 'translate3D(' + [-50, y, 0].join('px,') + 'px)';
        if (score > 100) {
          this.arrowTypes[modIndex].big = Math.random() < 0.3;
          this.arrowTypes[modIndex].up = Math.random() < 0.4;
        } else {
          this.arrowTypes[modIndex].big = Math.random() < 0.3;
          this.arrowTypes[modIndex].up = Math.random() < 0.6;
        }
      }
    });
  }

  render() {
    const { type } = this.props;
    let thumbs;
    switch (type) {
      case 'thumb':
        thumbs = this.thumbs.map((ref, i) => <Thumb ref={ref} key={i} />);
        break;
      default:
        thumbs = this.thumbs.map((ref, i) => (
          <Arrow ref={ref} key={i} {...this.arrowTypes[i]} />
        ));
        break;
    }
    return (
      <CountUpMarqueeContainer ref={this.container}>
        {thumbs}
        <LeftGradient />
      </CountUpMarqueeContainer>
    );
  }
}
