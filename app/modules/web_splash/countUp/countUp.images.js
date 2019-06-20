import React, { PureComponent, useState } from 'react';
import PropTypes from 'prop-types';
import { Text, View, Image } from 'modules/styled/web';
import { sizing, colors } from 'app/styles';
import { tween } from 'app/utils';
import styled from 'styled-components';

/* Thumb image (flying into box) */

const ThumbContainer = styled(View)`
  position: absolute;
  top: 0;
  right: -50px;
`;
const ThumbImage = styled(Image)`
  width: 48px;
  height: 50px;
`;
const ThumbContents = styled(Text)`
  position: absolute;
  top: 25px;
  left: 22px;
  font-size: 14px;
  font-weight: bold;
`;

export const Thumb = React.forwardRef((props, ref) => (
  <ThumbContainer ref={ref} {...props}>
    <ThumbImage src={'/img/thumb-bg.svg'} />
    <ThumbContents>{'+1'}</ThumbContents>
  </ThumbContainer>
));

/* Arrow image (big/small/up/down) */

const ArrowContainer = styled(View)`
  position: absolute;
  top: 0;
  right: -50px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
`;

const ArrowImage = styled(Image)`
  width: 50%;
`;

export const Arrow = React.forwardRef((props, ref) => (
  <ArrowContainer
    ref={ref}
    bounce
    w={props.big ? sizing(9) : sizing(3)}
    h={props.big ? sizing(9) : sizing(3)}
    {...props}
    bg={props.up ? colors.green : colors.red}
  >
    <ArrowImage
      src={props.up ? '/img/countUp-big-arrow-up.svg' : '/img/countUp-big-arrow-down.svg'}
    />
  </ArrowContainer>
));

Arrow.propTypes = {
  big: PropTypes.bool,
  up: PropTypes.bool
};

/* Big thumb with score (like box) */

const BigThumbContainer = styled(View)`
  position: relative;
  margin-left: ${sizing(2)};
  margin-right: ${sizing(2)};
  padding-bottom: ${sizing(2)};
  color: ${colors.black};
`;

const BigThumbImage = styled(Image)`
  width: ${sizing(14)};
  height: 60px;
`;

const BigThumbContents = styled(View)`
  position: absolute;
  top: 32px;
  left: 38px;
  width: 34px;
  justify-content: center;
  font-size: 16px;
  color: ${colors.black};
  font-weight: bold;
`;

export function BigThumb({ score }) {
  return (
    <BigThumbContainer>
      <BigThumbImage src={'/img/thumb.svg'} />
      <BigThumbContents>{score}</BigThumbContents>
    </BigThumbContainer>
  );
}
BigThumb.propTypes = {
  score: PropTypes.number
};

/* Arrows with score (Relevant box) */
const ArrowsContainer = styled(View)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: ${sizing(2)};
  margin-right: ${sizing(2)};
`;
const ArrowsImage = styled(Image)`
  width: ${sizing(14)};
  height: 50px;
  transition: ${p => (p.bounce ? 'transform .2 ease-out' : 'transform .7s ease-out')};
  transform: ${p => (p.bounce ? 'scale(1.2)' : '')};
`;

const ArrowsContents = styled(View)`
  justify-content: center;
  font-size: ${sizing(5)};
  height: ${sizing(5)};
  margin-top: ${sizing(3)};
`;

export function Arrows({ score }) {
  const [_score, setSize] = useState(0);
  const animate = _score !== score && score !== 0;
  if (animate) requestAnimationFrame(() => setSize(score));

  return (
    <ArrowsContainer>
      <ArrowsImage
        bounce={animate && _score < score}
        src={'/img/countUp-big-arrow-up.svg'}
      />
      <ArrowsContents bounce={animate}>{score}</ArrowsContents>
      <ArrowsImage
        bounce={animate && _score > score}
        src={'/img/countUp-big-arrow-down.svg'}
      />
    </ArrowsContainer>
  );
}

Arrows.propTypes = {
  score: PropTypes.number
};

/* Coin image (flying into betting box) */

const CoinContainer = styled(View)`
  position: absolute;
  top: 0;
  right: -100px;
  width: 100px;
  height: 100px;
  justify-content: center;
  align-items: center;
  background: ${colors.gold};
  color: black;
  border-radius: 50%;
  text-transform: uppercase;
  font-size: ${sizing(5)};
`;

export const Coin = React.forwardRef((props, ref) => (
  <CoinContainer ref={ref} {...props}>
    BET
  </CoinContainer>
));

/* Arrows with pie chart timer */

const TimerWidth = 50;
const LineWidth = 3.5;

const TimerCanvas = styled.canvas`
  width: ${TimerWidth};
  height: ${TimerWidth};
  margin-top: 10px;
  margin-bottom: 10px;
`;

export class ArrowTimer extends PureComponent {
  componentDidMount() {
    this.resize();
    this.reset();
  }

  componentDidUpdate(oldProps) {
    if (this.props.score !== oldProps.score) {
      this.animate();
    }
  }

  resize() {
    const { devicePixelRatio } = window;
    const w = TimerWidth * devicePixelRatio;
    const h = TimerWidth * devicePixelRatio;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = TimerWidth + 'px';
    this.canvas.style.height = TimerWidth + 'px';
  }

  reset(ctx) {
    ctx = ctx || this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;
    const lineWidth = LineWidth * devicePixelRatio;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - lineWidth, 0, 2.0 * Math.PI);
    ctx.stroke();
  }

  animate() {
    const { delay, duration, score, onTimerFinished } = this.props;
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;
    const lineWidth = LineWidth * devicePixelRatio;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    tween.remove(this.t);
    this.t = tween.add({
      from: { angle: 1.5 * Math.PI },
      to: { angle: 3.5 * Math.PI },
      delay,
      duration,
      // easing: tween.easing.circIn,
      update: ({ angle }) => {
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2, lineWidth);
        ctx.arc(w / 2, h / 2, w / 2 - lineWidth, 1.5 * Math.PI, angle);
        // ctx.lineTo(w / 2, h / 2);
        ctx.closePath();
        ctx.stroke();
      },
      finished: () => {
        this.reset(ctx);
        if (onTimerFinished) onTimerFinished(score);
      }
    });
  }

  render() {
    // to test, add to the TimerCanvas: onClick={() => this.animate()}
    return (
      <ArrowsContainer>
        <ArrowsImage src={'/img/countUp-black-arrow-up.svg'} />
        <TimerCanvas ref={ref => (this.canvas = ref)} />
        <ArrowsImage src={'/img/countUp-black-arrow-down.svg'} />
      </ArrowsContainer>
    );
  }
}

ArrowTimer.propTypes = {
  score: PropTypes.number,
  delay: PropTypes.number,
  duration: PropTypes.number,
  onTimerFinished: PropTypes.func
};
