import React, { Component } from 'react';
import { StyleSheet, Animated, Easing, Image, Text } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';

let styles;
const ENDY = fullHeight * 0.5;

class Coin extends Component {
  static propTypes = {
    parent: PropTypes.object,
    specialKey: PropTypes.number,
    amount: PropTypes.object,
    destroy: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      position: new Animated.Value(0)
    };
  }

  componentWillMount() {
    const { x, y, w, h } = this.props.parent;
    const ENDX = Math.random() * 50;

    this.y = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [y, y - ENDY],
      easing: Easing.in(Easing.ease)
    });

    this.x = this.state.position.interpolate({
      inputRange: [0, 0.5 * Math.random(), 1],
      outputRange: [x, x + ENDX / 2, x + ENDX],
      easing: Easing.out(Easing.ease)
    });

    this.opacity = this.state.position.interpolate({
      inputRange: [0.7, 1],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    });

    this.rotateAnimation = this.state.position.interpolate({
      inputRange: [0, 1 / 4, 1 / 3, 1 / 2, 1],
      outputRange: ['0deg', '-2deg', '0deg', '2deg', '0deg']
    });

    this.scale = this.state.position.interpolate({
      inputRange: [0, 0.2, 0.3, 1],
      outputRange: [0, 1.2, 1, 1.5],
      extrapolate: 'clamp'
    });
  }

  componentDidMount() {
    const i = this.props.specialKey;
    const r = Math.random();
    const amount = this.props.amount;

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: r * 30 + (i * 100 * 10) / amount,
      duration: 1000
    }).start(() => this.props.destroy(null, i));
  }

  render() {
    const specialKey = this.props.specialKey;
    let img;

    const icon = require('../../assets/images/relevantcoin.png');

    img = <Image style={[styles.coin, { width: 20, height: 20 }]} source={icon} />;

    return (
      <Animated.View
        key={specialKey}
        style={[
          styles.aniMoney,
          {
            transform: [{ translateX: this.x }, { translateY: this.y }, { scale: this.scale }],
            opacity: this.opacity
          }
        ]}
      >
        {img}
      </Animated.View>
    );
  }
}

export default Coin;

const localStyles = StyleSheet.create({
  aniMoney: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent'
  }
});

styles = { ...localStyles, ...globalStyles };
