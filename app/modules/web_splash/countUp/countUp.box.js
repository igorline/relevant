import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { BigThumb, Arrows, ArrowTimer } from './countUp.images';

const CountUpBoxContainer = styled(View)`
  width: ${sizing(75)};
  height: ${sizing(30)};
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.5s ease;
  ${p => (p.c ? `color: ${p.c};` : '')};
`;

const Headline = styled(Text)`
  text-transform: uppercase;
  font-size: ${sizing(5)};
  line-height: ${sizing(5)};
  ${p => (p.type === 'coin' ? `height: ${sizing(12)}; white-space: pre;` : '')}
`;

export default class CountUpBox extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    score: PropTypes.number,
    headline: PropTypes.string,
    color: PropTypes.string,
    onHeadlineFinished: PropTypes.func,
    onTimerFinished: PropTypes.func,
    thumbTiming: PropTypes.object
  };

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.headline !== this.props.headline) {
      this.animate();
    }
  }

  animate() {
    const { headline, onHeadlineFinished } = this.props;
    const len = headline.length;
    let lastIndex = 0;
    tween.remove(this.t);
    this.t = tween.add({
      duration: 500,
      easing: tween.easing.circOut,
      update: (obj, t) => {
        const roundedIndex = Math.round(t * len);
        if (lastIndex !== roundedIndex) {
          lastIndex = roundedIndex;
          this.label.innerHTML = headline.substr(0, roundedIndex);
        }
      },
      finished: () => {
        if (onHeadlineFinished) onHeadlineFinished();
      }
    });
  }

  render() {
    const { type, color, score, thumbTiming, onTimerFinished } = this.props;
    return (
      <CountUpBoxContainer bg={color} c={type === 'coin' ? 'black' : 'white'}>
        {type === 'thumb' ? (
          <BigThumb score={score} {...thumbTiming} />
        ) : type === 'relevant' ? (
          <Arrows score={score} {...thumbTiming} />
        ) : (
          <ArrowTimer score={score} {...thumbTiming} onTimerFinished={onTimerFinished} />
        )}
        <Headline type={type} ref={ref => (this.label = ref)} />
      </CountUpBoxContainer>
    );
  }
}
