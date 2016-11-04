'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated,
  Easing
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let localStyles;

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
    const self = this;
    const i = self.props.specialKey;

    Animated.parallel([
      Animated.timing(self.state.yVal, {
        toValue: -300,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.quad
      }),
      Animated.timing(self.state.opacity, {
        toValue: 0,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.linear
      }),
      Animated.timing(self.state.scale, {
        toValue: 1.5,
        delay: 100 * i,
        duration: 1000,
        easing: Easing.linear
      }),
    ]).start();
  }

  render() {
    const self = this;
    const styles = localStyles;
    const key = this.props.specialKey;

    return (
      <Animated.Text
        pointerEvents={'none'}
        key={key}
        style={[styles.aniHeart,
          { transform: [
            { translateY: self.state.yVal },
            { translateX: self.state.xVal },
            { scale: self.state.scale }
          ],
          opacity: self.state.opacity
        }]}
      >
        ❤️
      </Animated.Text>
    );
  }
}

export default Heart;

localStyles = StyleSheet.create({
  aniHeart: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'transparent'
  },
});
