import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let styles;

class Heart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      opacity: new Animated.Value(1),
      yVal: new Animated.Value(0),
      xVal: new Animated.Value(0),
      scale: new Animated.Value(1),
    };
  }

  componentDidMount() {
    const i = this.props.specialKey;

    Animated.parallel([
      Animated.timing(this.state.yVal, {
        toValue: -300,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.quad
      }),
      Animated.timing(this.state.opacity, {
        toValue: 0,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.linear
      }),
      Animated.timing(this.state.scale, {
        toValue: 1.5,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.linear
      }),
    ]).start();
  }

  render() {
    const key = this.props.specialKey;

    return (
      <Animated.Text
        pointerEvents={'none'}
        key={key}
        style={[styles.aniHeart,
          { transform: [
            { translateY: this.state.yVal },
            { translateX: this.state.xVal },
            { scale: this.state.scale }
          ],
          opacity: this.state.opacity
        }]}
      >
        ❤️
      </Animated.Text>
    );
  }
}

export default Heart;

styles = StyleSheet.create({
  aniHeart: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'transparent'
  },
});
