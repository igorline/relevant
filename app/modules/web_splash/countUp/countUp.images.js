import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, Image } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

/* Thumb image (flying into box) */

const ThumbContainer = styled(View)`
  position: absolute;
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

/* Big thumb with score (like box) */

const BigThumbContainer = styled(View)`
  position: relative;
  margin-left: ${sizing(2)};
  margin-right: ${sizing(2)};
  padding-bottom: ${sizing(2)};
`;
const BigThumbImage = styled(Image)`
  width: 60px;
  height: 60px;
`;
const BigThumbContents = styled(View)`
  position: absolute;
  top: 32px;
  left: 20px;
  width: 34px;
  justify-content: center;
  font-size: 16px;
`;
export class BigThumb extends PureComponent {
  componentDidMount() {
    this.animate(this.props.score);
  }

  componentDidUpdate() {
    this.animate(this.props.score);
  }

  animate(score) {
    const { delay, duration } = this.props;
    let lastScore = -1;
    tween.remove(this.t);
    setTimeout(() => {
      this.label.innerHTML = '';
    }, 500);
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

export const Arrows = styled(View)`
  width: 48px;
  height: 50px;
`;
