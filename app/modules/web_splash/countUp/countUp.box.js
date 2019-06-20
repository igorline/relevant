import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, BodyText } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing } from 'app/styles';
import { tween } from 'app/utils';

import { BigThumb, Arrows, ArrowTimer } from './countUp.images';

const BetResult = styled(Text)`
  position: absolute;
  width: 200px;
  height: 200px;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
`;
const BetWin = styled(BetResult)`
  top: -60px;
  right: -100px;
  transform: rotate(23deg);
  background-image: url(/img/betWin.png);
`;
const BetLoose = styled(BetResult)`
  bottom: -60px;
  right: -20px;
  background-image: url(/img/betLoose.png);
  transform: rotate(-15deg);
`;

const CountUpBoxContainer = styled(View)`
  width: ${sizing(75)};
  height: ${sizing(30)};
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  transition: background-color 0.5s ease;
  ${p => (p.c ? `color: ${p.c};` : '')};
`;

const CountUpBoxShadow = styled(View)`
  position: absolute;
  width: ${sizing(75)};
  height: ${sizing(30)};
  top: 0;
  box-shadow: -4px 0px 5px -1px #dddddd;
  z-index: -1;
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
    thumbTiming: PropTypes.object,
    outcome: PropTypes.string
  };

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.headline !== this.props.headline) {
      this.animate();
    }
  }

  animateRewards = () => {};

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
    const { type, color, score, thumbTiming, onTimerFinished, outcome } = this.props;
    return (
      <CountUpBoxContainer bg={color} c={type === 'relevant' ? 'white' : 'black'}>
        {type === 'thumb' ? (
          <BigThumb score={score} {...thumbTiming} />
        ) : type === 'relevant' ? (
          <Arrows score={score} {...thumbTiming} />
        ) : (
          <ArrowTimer
            score={score}
            {...thumbTiming}
            onTimerFinished={() => {
              this.animateRewards();
              onTimerFinished();
            }}
          />
        )}
        {outcome === 'win' && (
          <BetWin>
            <BodyText p={4} fs={3} lh={4}>
              YOU WIN!
            </BodyText>
          </BetWin>
        )}
        {outcome === 'loose' && (
          <BetLoose>
            <BodyText p={7} fs={3} lh={4}>
              NOT A GREAT BET :(
            </BodyText>
          </BetLoose>
        )}
        <Headline type={type} ref={ref => (this.label = ref)} />
        <CountUpBoxShadow />
      </CountUpBoxContainer>
    );
  }
}
