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
    let r = Math.random();

    Animated.parallel([
      Animated.timing(this.state.x, {
        toValue: -(fullWidth / 2.5) + ((Math.random() - 0.5) * 50),
        delay: i * (30 + r * 50),
        duration: 500,
        easing: Easing.out(Easing.ease),
        // useNativeDriver: true,
      }),

      Animated.timing(this.state.y, {
        toValue: fullHeight * 0.6,
        delay: i * (30 + r * 50),
        duration: 500,
        easing: Easing.in(Easing.ease),
        // useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.timing(this.state.scale, {
          toValue: 1,
          delay: i * (30 + r * 50),
          duration: 450,
          easing: Easing.out(Easing.exp),
          // useNativeDriver: true,
        }),
        Animated.timing(this.state.scale, {
          toValue: 0,
          delay: 1,
          duration: 50,
          easing: Easing.in(Easing.quad),
          // useNativeDriver: true,
        })
      ])
    ]).start();

    setTimeout(() => this.props.destroy(i), 500 + i * (30 + r * 50));
  }

  render() {
    let specialKey = this.props.specialKey;
    let img;

    let icon = require('../../assets/images/relevantcoin.png');
    // if (this.props.amount < 0) {
    //   icon = require('../../assets/images/rdown.png');
    // }

    // if (Math.random() < 0.4 && this.props.amount >= 0) {
      img = (<Image
        style={[styles.coin, { width: 25, height: 25 }]}
        source={icon}
      />);
    // } else if (this.props.amount >= 0) {
    //   img = (<Text style={{ fontSize: 45 }}>✨</Text>);
    // } else {
    //   img = (<Image
    //     style={[styles.coin, { width: 30, height: 30 }]}
    //     source={icon}
    //   />);
    // }

    return (
      <Animated.View
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
      </Animated.View>
    );
  }
}

export default Dollar;

const localStyles = StyleSheet.create({
  aniMoney: {
    // fontSize: 16 * 4,
    position: 'absolute',
    top: 25,
    right: 45,
    backgroundColor: 'transparent'
  },
});

styles = { ...localStyles, ...globalStyles };

