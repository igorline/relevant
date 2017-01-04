import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let styles;

class Dollar extends Component {
  constructor (props, context) {
    super(props, context);
    this.state = {
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1)
    };
  }

  componentDidMount() {
    let i = this.props.specialKey;

    Animated.timing(this.state.x, {
      toValue: -(fullWidth / 2.6),
      delay: i * 30,
      duration: 300,
      easing: Easing.out(Easing.cubic)
    }).start();

    Animated.timing(this.state.y, {
      toValue: fullHeight * 0.6,
      delay: i * 30,
      duration: 300,
      easing: Easing.linear
    }).start();

    // Animated.timing(this.state.opacity, {
    //   toValue: 0,
    //   delay: i * 50 + 200,
    //   duration: 100,
    //   easing: Easing.in(Easing.exp)
    // }).start();

    Animated.sequence([
      Animated.timing(this.state.scale, {
        toValue: 1,
        delay: i * 30,
        duration: 200,
        easing: Easing.out(Easing.exp)
      }),
      Animated.timing(this.state.scale, {
        toValue: 0,
        delay: 0,
        duration: 100,
        easing: Easing.in(Easing.quad)
      })
    ]).start();
  }

  render() {
    let specialKey = this.props.specialKey;

    return (
      <Animated.Text
        key={specialKey}
        style={[
          styles.aniMoney,
          { transform: [
            { translateX: this.state.x },
            { translateY: this.state.y },
            { scale: this.state.scale },

          ],
          opacity: this.state.opacity
        }]}
      >
        💵
      </Animated.Text>
    );
  }
}

export default Dollar;

const localStyles = StyleSheet.create({
  aniMoney: {
    fontSize: 16 * 4,
    position: 'absolute',
    top: 5,
    right: 7,
    backgroundColor: 'transparent'
  },
});

styles = localStyles;

