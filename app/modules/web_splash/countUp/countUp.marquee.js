import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { Thumb } from './countUp.images';

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
    active: PropTypes.bool,
    firingRate: PropTypes.number,
    parallax: PropTypes.number,
    speed: PropTypes.number,
    onMeasure: PropTypes.func
  };

  constructor() {
    super();
    this.index = 0;
    this.thumbs = [];
    for (let i = 0; i < 20; i++) {
      this.thumbs.push(React.createRef());
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
    const { parallax, speed } = this.props;
    const width = this.container.current.offsetWidth;
    const duration = width * speed;
    let height = this.container.current.offsetHeight;
    height = (height - 100) / 2;
    const y = randint(height) + (index % 2) * (height + 50);
    const el = this.thumbs[index % this.thumbs.length];
    if (!el || !el.current || !y) return;
    tween.add({
      from: { x: -50 },
      to: { x: width },
      duration: duration + randint(parallax),
      easing: tween.easing.circOut,
      update: ({ x }) => {
        el.current.style.transform =
          'translate3D(' + [x.toFixed(1), y, 0].join('px,') + 'px)';
      },
      finished: () => {
        el.current.style.transform = 'translate3D(' + [-50, y, 0].join('px,') + 'px)';
      }
    });
  }

  render() {
    const thumbs = this.thumbs.map((ref, i) => <Thumb ref={ref} key={i} />);
    return (
      <CountUpMarqueeContainer ref={this.container}>
        {thumbs}
        <LeftGradient />
      </CountUpMarqueeContainer>
    );
  }
}
