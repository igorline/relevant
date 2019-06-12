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
      el.current.style.transform = 'translate3D(' + [10, 0, 0].join('px,') + 'px)';
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
      this.setState({ index });
    } else {
      this.timeout = setTimeout(() => this.animate(index), 100);
    }
  }

  add(index) {
    let { parallax } = this.props;
    const { speed, score, type, onFinished } = this.props;
    const width = this.container.current.offsetWidth;
    const duration = width * speed;
    let height = this.container.current.offsetHeight;
    let y;
    let elScore = 1;
    const modIndex = index % this.thumbs.length;
    const el = this.thumbs[modIndex];
    const arrowType = this.arrowTypes[modIndex];

    switch (type) {
      case 'relevant':
        parallax *= 1.5;
        height = (height - 100) / 2;
        y = randint(height) + (index % 2) * (height + 50);
        if (score > 100) {
          arrowType.big = Math.random() < 0.5;
          arrowType.up = arrowType.big ? Math.random() < 0.9 : Math.random() < 0.2;
        } else {
          arrowType.big = Math.random() < 0.5;
          arrowType.up = arrowType.big ? Math.random() < 0.2 : Math.random() < 0.9;
        }
        if (arrowType.big) {
          elScore = randint(10) + 10;
        } else {
          elScore = randint(5);
        }
        if (!arrowType.up) {
          elScore *= -1;
        }
        if (index % 2) {
          y -= 10;
        } else {
          y += 10;
        }
        break;
      default:
        // 'thumb'
        height = (height - 100) / 2;
        y = randint(height) + (index % 2) * (height + 50);
        break;
    }

    if (!el || !el.current || !y) return;
    tween.add({
      from: { x: -width - 50 - randint(parallax) },
      to: { x: 0 },
      duration,
      easing: tween.easing.circOut,
      update: ({ x }) => {
        el.current.style.transform =
          'translate3D(' + [x.toFixed(1), y, 0].join('px,') + 'px)';
      },
      finished: () => {
        el.current.style.transform = 'translate3D(' + [10, y, 0].join('px,') + 'px)';
        if (onFinished) onFinished(elScore);
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
