import React, { Component } from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  Image,
  Text
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';

let styles;
let ENDY = fullHeight * 0.7;

class Dollar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      position: new Animated.Value(0),
    };
  }

  componentWillMount() {
    let ENDX = -(fullWidth / 3) + ((Math.random() - 0.5) * 50);

    this.y = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, ENDY],
      easing: Easing.in(Easing.ease)
    });

    this.x = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, ENDX],
      easing: Easing.out(Easing.ease),
    });

    this.opacity = 1;
    // this.opacity = this.state.position.interpolate({
    //   inputRange: [0.8, 1],
    //   outputRange: [1, 0],
    //   easing: Easing.out(Easing.ease),
    //   extrapolate: 'clamp'
    // });

    this.scale = this.state.position.interpolate({
      inputRange: [0, 0.5, 0.9, 1],
      outputRange: [0, 1, 1, 0],
      extrapolate: 'clamp'
    });
  }

  componentDidMount() {
    let i = this.props.specialKey;
    let r = Math.random();
    let amount = this.props.amount;

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: r * 30 + i * 100 * 10 / amount,
      duration: 1000,
    }).start(() => this.props.destroy(i));
  }

  render() {
    let specialKey = this.props.specialKey;
    let img;

    let icon = require('../../assets/images/relevantcoin.png');

    img = (<Image
      style={[styles.coin, { width: 30, height: 30 }]}
      source={icon}
    />);

    return (
      <Animated.View
        key={specialKey}
        style={[
          styles.aniMoney,
          { transform: [
            { translateX: this.x },
            { translateY: this.y },
            { scale: this.scale },

          ],
            opacity: this.opacity
          }
        ]}
      >
        {img}
      </Animated.View>
    );
  }
}

export default Dollar;

const localStyles = StyleSheet.create({
  aniMoney: {
    position: 'absolute',
    top: 25,
    right: 45,
    backgroundColor: 'transparent'
  },
});

styles = { ...localStyles, ...globalStyles };

