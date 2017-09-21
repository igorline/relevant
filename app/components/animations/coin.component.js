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
let ENDY = fullHeight * 0.6;

class Dollar extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      position: new Animated.Value(0),
    };
  }

  componentWillMount() {

    let ENDX = -(fullWidth / 2.5) + ((Math.random() - 0.5) * 50);

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

    this.scale = this.state.position.interpolate({
      inputRange: [0, .3, .9, 1],
      outputRange: [0, 1, 1, 0],
      extrapolate: 'clamp'
    });

  }

  componentDidMount() {
    let i = this.props.specialKey;
    let r = Math.random();

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: i * (30 + r * 50),
      duration: 500,
    }).start(() => this.props.destroy(i));
  }

  render() {
    let specialKey = this.props.specialKey;
    let img;

    let icon = require('../../assets/images/relevantcoin.png');

    img = (<Image
      style={[styles.coin, { width: 25, height: 25 }]}
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

