import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, Image } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing, colors } from 'app/styles';
import { tween } from 'app/utils';

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
  background: #ffffff;
  box-shadow: 1px 0px 4px 4px #dddddd;
  border-radius: 50%;
`;
const ArrowImage = styled(Image)`
  width: 12px;
  height: 12px;
`;
export const Arrow = React.forwardRef((props, ref) => (
  <ArrowContainer ref={ref} p={props.big ? sizing(3.2) : sizing(1)} {...props}>
    <ArrowImage
      src={
        props.up ? '/img/countUp-small-arrow-up.svg' : '/img/countUp-small-arrow-down.svg'
      }
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
`;
export class BigThumb extends PureComponent {
  componentDidMount() {
    this.animate();
  }

  componentDidUpdate() {
    this.animate();
  }

  animate() {
    const { score, delay, duration } = this.props;
    let lastScore = -1;
    tween.remove(this.t);
    setTimeout(() => {
      this.label.innerHTML = '';
    }, 0);
    this.t = tween.add({
      from: { score: 1 },
      to: { score },
      delay,
      duration,
      easing: tween.easing.circIn,
      update: obj => {
        const roundedScore = Math.round(obj.score);
        if (roundedScore !== lastScore) {
          lastScore = roundedScore;
          this.label.innerHTML = roundedScore;
        }
      }
    });
  }

  render() {
    return (
      <BigThumbContainer>
        <BigThumbImage src={'/img/thumb-white.svg'} />
        <BigThumbContents ref={ref => (this.label = ref)} />
      </BigThumbContainer>
    );
  }
}
BigThumb.propTypes = {
  score: PropTypes.number,
  delay: PropTypes.number,
  duration: PropTypes.number
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
`;
const ArrowsContents = styled(View)`
  justify-content: center;
  font-size: ${sizing(5)};
  height: ${sizing(5)};
  margin-top: ${sizing(3)};
`;
export class Arrows extends PureComponent {
  render() {
    return (
      <ArrowsContainer>
        <ArrowsImage src={'/img/countUp-big-arrow-up.svg'} />
        <ArrowsContents ref={ref => (this.label = ref)}>
          {this.props.score}
        </ArrowsContents>
        <ArrowsImage src={'/img/countUp-big-arrow-down.svg'} />
      </ArrowsContainer>
    );
  }
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
  box-shadow: 1px 0px 4px 4px #dddddd;
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

export class ArrowTimer extends PureComponent {
  render() {
    return (
      <ArrowsContainer>
        <ArrowsImage src={'/img/countUp-black-arrow-up.svg'} />
        <ArrowsContents ref={ref => (this.label = ref)}>{'π'}</ArrowsContents>
        <ArrowsImage src={'/img/countUp-black-arrow-down.svg'} />
      </ArrowsContainer>
    );
  }
}
ArrowTimer.propTypes = {};
