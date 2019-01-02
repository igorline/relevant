import React, { Component } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';

let styles;

class Heart extends Component {
  static propTypes = {
    id: PropTypes.object,
    destroy: PropTypes.func,
    specialKey: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0)
    };
  }

  componentDidMount() {
    const key = this.props.id;

    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 0,
        delay: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(this.state.scale, {
        toValue: 1,
        delay: 0,
        duration: 500,
        easing: Easing.elastic(2),
        useNativeDriver: true
      })
      .start()
    ])
    .start();

    setTimeout(() => this.props.destroy(key), 2000);
  }

  render() {
    const key = this.props.specialKey;

    return (
      <Animated.Text
        pointerEvents={'none'}
        key={key}
        style={[
          styles.aniHeart,
          {
            transform: [
              { scale: this.state.scale }
              // { translateY: this.state.yVal },
              // { translateX: this.state.xVal },
            ],
            opacity: this.state.opacity
          }
        ]}
      >
        👎
      </Animated.Text>
    );
  }
}

export default Heart;

styles = StyleSheet.create({
  aniHeart: {
    position: 'absolute',
    top: 0,
    padding: 10,
    fontSize: 100,
    // bottom: 40,
    backgroundColor: 'transparent'
  }
});
