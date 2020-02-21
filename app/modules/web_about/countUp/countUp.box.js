import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, InlineText } from 'modules/styled/web';
import styled from 'styled-components';
import { sizing, size } from 'app/styles';
import { tween } from 'app/utils';

const CountUpBoxContainer = styled(View)`
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  transition: background-color 0.5s ease;
  ${p => (p.c ? `color: ${p.c};` : '')};
`;

const CountUpBoxShadow = styled(View)`
  position: absolute;
  top: 0;
  box-shadow: -4px 0px 5px -1px #dddddd;
  z-index: -1;
`;

const Headline = styled(Text)`
  text-transform: uppercase;
  font-size: ${() => size([5, 3])};
  line-height: ${() => size([5, 3])};
  ${p => (p.hide ? 'visibility: hidden;' : '')}
`;

export default class CountUpBox extends PureComponent {
  static propTypes = {
    height: PropTypes.number,
    type: PropTypes.string,
    headline: PropTypes.string,
    color: PropTypes.string,
    onHeadlineFinished: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
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
          this.labelRest.innerHTML = headline.substr(roundedIndex, headline.length - 1);
        }
      },
      finished: () => {
        if (onHeadlineFinished) onHeadlineFinished();
      }
    });
  }

  render() {
    const { type, color, children, height } = this.props;
    const width = [sizing(75), '65%'];

    return (
      <CountUpBoxContainer
        h={height}
        w={width}
        bg={color}
        c={type === 'relevant' ? 'white' : 'black'}
        pr={1}
      >
        {children}
        <InlineText>
          <Headline inline={1} ref={ref => (this.label = ref)} />
          <Headline inline={1} hide ref={ref => (this.labelRest = ref)} />
        </InlineText>
        <CountUpBoxShadow h={height} w={width} />
      </CountUpBoxContainer>
    );
  }
}
