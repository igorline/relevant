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

class Dollar extends Component {
  constructor(props, context) {
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
      toValue: -(fullWidth / 2.3) + ((Math.random() - 0.5) * 50),
      delay: i * 30,
      duration: 500,
      easing: Easing.out(Easing.ease)
    }).start();

    Animated.timing(this.state.y, {
      toValue: fullHeight * 0.6,
      delay: i * 30,
      duration: 500,
      easing: Easing.in(Easing.ease)
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
        duration: 450,
        easing: Easing.out(Easing.exp)
      }),
      Animated.timing(this.state.scale, {
        toValue: 0,
        delay: 0,
        duration: 50,
        easing: Easing.in(Easing.quad)
      })
    ]).start();
  }

  render() {
    let specialKey = this.props.specialKey;
    let img;

    let icon = require('../../assets/images/rup.png');
    if (this.props.amount < 0) {
      icon = require('../../assets/images/rdown.png');
    }

    if (Math.random() < 0.4 && this.props.amount >= 0) {
      img = (<Image
        style={[styles.coin, { width: 30, height: 30 }]}
        source={icon}
      />);
    } else if (this.props.amount >= 0) {
      img = (<Text style={{ fontSize: 45 }}>✨</Text>);
    } else {
      img = (<Image
        style={[styles.coin, { width: 30, height: 30 }]}
        source={icon}
      />);
    }

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
          }
        ]}
      >
        {img}
      </Animated.Text>
    );
  }
}

export default Dollar;

const localStyles = StyleSheet.create({
  aniMoney: {
    fontSize: 16 * 4,
    position: 'absolute',
    top: 25,
    right: 15,
    backgroundColor: 'transparent'
  },
});

styles = { ...localStyles, ...globalStyles };

