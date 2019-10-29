import React, { Component } from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';
import { animatedElement } from 'app/styles/layout';
import { colors } from 'app/styles';
import { Title } from 'modules/styled/uni';

const ENDY = 100;

class VoteNumber extends Component {
  static propTypes = {
    parent: PropTypes.object,
    specialKey: PropTypes.number,
    amount: PropTypes.number,
    destroy: PropTypes.func,
    horizontal: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      position: new Animated.Value(0)
    };
  }

  componentWillMount() {
    const { x, y } = this.props.parent;
    const ENDX = (Math.random() - 0.5) * 20;

    this.y = this.state.position.interpolate({
      inputRange: [0, 1],
      outputRange: [y + 10, y - ENDY]
    });

    this.x = this.state.position.interpolate({
      inputRange: [0, 0.05, 0.5, 1],
      outputRange: [x - 15, x, x + ENDX / 2, x + ENDX]
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
      inputRange: [0, 0.05, 0.1, 0.9, 0.95, 1],
      outputRange: [0, 1.4, 1, 1, 1.2, 0]
    });
  }

  componentDidMount() {
    const { amount } = this.props;
    const i = this.props.specialKey;
    const r = Math.random();

    Animated.timing(this.state.position, {
      toValue: 1,
      delay: r * 30 + (i * 100 * 10) / amount,
      duration: 2000,
      useNativeDriver: true
    }).start(() => this.props.destroy(null, i));
  }

  render() {
    const { amount, parent, horizontal } = this.props;
    const { w } = parent;
    const { specialKey } = this.props;
    const element = <Title c={colors.green}>+{amount}</Title>;

    return (
      <Animated.View
        key={specialKey}
        style={[
          { ...animatedElement },
          {
            left: horizontal ? 20 : (w * 2) / 3,
            transform: [
              { translateX: this.x },
              { translateY: this.y },
              { scale: this.scale }
            ],
            opacity: this.opacity
          }
        ]}
      >
        {element}
      </Animated.View>
    );
  }
}

export default VoteNumber;
