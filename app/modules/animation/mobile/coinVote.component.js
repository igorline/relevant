import React, { Component } from 'react';
import { Animated, Easing, Image } from 'react-native';
import PropTypes from 'prop-types';
import { animatedElement } from 'app/styles/layout';

const ENDY = 300;

class Coin extends Component {
  static propTypes = {
    parent: PropTypes.object,
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
    const { x, y } = this.props.parent;
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
    const { amount } = this.props;
    const i = this.props.specialKey;
    const r = Math.random();

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: r * 30 + (i * 100 * 10) / amount,
      duration: 1000
    }).start(() => this.props.destroy(null, i));
  }

  render() {
    const { w } = this.props.parent;
    const { specialKey } = this.props;
    const icon = require('app/public/img/relevantcoin.png');
    const img = <Image style={{ width: 20, height: 20 }} source={icon} />;

    return (
      <Animated.View
        key={specialKey}
        style={[
          { ...animatedElement },
          {
            left: w / 3,
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

export default Coin;
