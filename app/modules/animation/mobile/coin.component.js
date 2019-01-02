import React, { Component } from 'react';
import { StyleSheet, Animated, Easing, Image } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, fullHeight } from 'app/styles/global';

let styles;
const ENDY = fullHeight * 0.7;

class Dollar extends Component {
  static propTypes = {
    specialKey: PropTypes.number,
    amount: PropTypes.number,
    destroy: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      position: new Animated.Value(0)
    };
  }

  componentWillMount() {
    const ENDX = -(fullWidth / 3) + (Math.random() - 0.5) * 50;

    this.y = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, ENDY],
      easing: Easing.in(Easing.ease)
    });

    this.x = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, ENDX],
      easing: Easing.out(Easing.ease)
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
    const { amount } = this.props;
    const i = this.props.specialKey;
    const r = Math.random();

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: r * 30 + (i * 100 * 10) / amount,
      duration: 1000
    })
    .start(() => this.props.destroy(i));
  }

  render() {
    const { specialKey } = this.props;
    const icon = require('app/public/img/relevantcoin.png');
    const img = <Image style={[styles.coin, { width: 30, height: 30 }]} source={icon} />;

    return (
      <Animated.View
        key={specialKey}
        style={[
          styles.aniMoney,
          {
            transform: [
              { translateX: this.x },
              { translateY: this.y },
              { scale: this.scale }
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
  }
});

styles = { ...localStyles, ...globalStyles };
