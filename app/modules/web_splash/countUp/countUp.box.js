import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { BigThumb, Arrows } from './countUp.images';

const CountUpBoxContainer = styled(View)`
  width: ${sizing(75)};
  height: ${sizing(30)};
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  color: white;
`;

const Headline = styled(Text)`
  text-transform: uppercase;
  font-size: ${sizing(5)};
`;

export default class CountUpBox extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    score: PropTypes.number,
    headline: PropTypes.string,
    color: PropTypes.string,
    thumbTiming: PropTypes.object
  };

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate() {
    this.animate();
  }

  animate() {
    const { headline } = this.props;
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
      }
    });
  }

  render() {
    const { type, score, color, thumbTiming } = this.props;
    return (
      <CountUpBoxContainer bg={color}>
        {type === 'thumb' ? (
          <BigThumb score={score} {...thumbTiming} />
        ) : (
          <Arrows score={score} {...thumbTiming} />
        )}
        <Headline ref={ref => (this.label = ref)} />
      </CountUpBoxContainer>
    );
  }
}
