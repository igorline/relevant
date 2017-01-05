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
      scale: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const i = this.props.specialKey;
    const { delay } = this.props;

    Animated.parallel([
      Animated.timing(this.state.yVal, {
        toValue: -400,
        delay: delay * i,
        duration: 1000,
        easing: Easing.quad
      }),
      Animated.timing(this.state.opacity, {
        toValue: 0,
        delay: delay * i,
        duration: 1000,
        easing: Easing.in(Easing.exp)
      }),
      Animated.sequence([
        Animated.timing(this.state.xVal, {
          toValue: (Math.random() - 0.5) * 20,
          delay: delay * i,
          duration: 500,
          easing: Easing.ease
        }),
        Animated.timing(this.state.xVal, {
          toValue: 0,
          delay: 500,
          duration: 500,
          easing: Easing.ease
        }),
      ]),
      Animated.sequence([
        Animated.timing(this.state.scale, {
          toValue: 0.5,
          delay: delay * i,
          duration: 100,
          easing: Easing.in(Easing.exp)
        }),
        Animated.timing(this.state.scale, {
          toValue: 1,
          delay: 100,
          duration: 500,
          easing: Easing.ease
        }),
      ]).start()
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
            { scale: this.state.scale },
            { translateY: this.state.yVal },
            { translateX: this.state.xVal },
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
    fontSize: 12 * 2,
    bottom: 40,
    backgroundColor: 'transparent'
  },
});
