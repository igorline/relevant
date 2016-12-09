import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  // Text
} from 'react-native';

import Svg,{
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Text,
    Use,
    Defs,
    Stop
} from 'react-native-svg';

import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class StrokeText extends Component {

  render() {
    let text = '';
    if (this.props.text) text = this.props.text;

    return (
      <Svg
        height="30"
        width="110"
      >
        <Text
          fill="none"
          stroke="black"
          fontSize="26"
          fontWeight="bold"
          x="0"
          y="3"
        >
          {text}
        </Text>
      </Svg>
    );
  }
}

export default StrokeText;

const localStyles = StyleSheet.create({
});

