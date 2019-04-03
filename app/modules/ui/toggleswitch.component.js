/**
 * toggle-switch-react-native
 * Toggle Switch component for react native, it works on iOS and Android
 * https://github.com/aminebenkeroum/toggle-switch-react-native
 * Email:amine.benkeroum@gmail.com
 * Blog: https://medium.com/@aminebenkeroum/
 * @benkeroumamine
 */

import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';

import { Text, View } from 'modules/styled/uni';
import PropTypes from 'prop-types';

export default class ToggleSwitch extends React.Component {
  static calculateDimensions(size) {
    switch (size) {
      case 'small':
        return {
          width: 50,
          padding: 10,
          circleWidth: 15,
          circleHeight: 15,
          translateX: 22
        };
      case 'large':
        return {
          width: 100,
          padding: 20,
          circleWidth: 30,
          circleHeight: 30,
          translateX: 38
        };
      default:
        return {
          width: 60,
          padding: 12,
          circleWidth: 18,
          circleHeight: 18,
          translateX: 26
        };
    }
  }

  static propTypes = {
    isOn: PropTypes.bool.isRequired,
    label: PropTypes.string,
    onColor: PropTypes.string.isRequired,
    offColor: PropTypes.string.isRequired,
    size: PropTypes.string,
    labelStyle: PropTypes.object,
    onToggle: PropTypes.func.isRequired,
    icon: PropTypes.object
  };

  static defaultProps = {
    isOn: false,
    onColor: '#634fc9',
    offColor: '#ecf0f1',
    size: 'medium',
    labelStyle: {},
    icon: null
  };

  offsetX = new Animated.Value(0);
  dimensions = ToggleSwitch.calculateDimensions(this.props.size);

  createToggleSwitchStyle = () => ({
    display: 'flex',
    justifyContent: 'center',
    width: this.dimensions.width,
    borderRadius: 20,
    padding: this.dimensions.padding,
    backgroundColor: this.props.isOn ? this.props.onColor : this.props.offColor
  });

  createInsideCircleStyle = () => ({
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    position: 'absolute',
    backgroundColor: 'white',
    transform: [{ translateX: this.offsetX }],
    width: this.dimensions.circleWidth,
    height: this.dimensions.circleHeight,
    borderRadius: this.dimensions.circleWidth / 2
  });

  render() {
    const toValue = this.props.isOn
      ? this.dimensions.width - this.dimensions.translateX
      : 0;

    Animated.timing(this.offsetX, {
      toValue,
      duration: 300
    }).start();

    return (
      <View fdirection="row" align="center">
        {this.props.label ? (
          <Text margin={'0 1'} style={[this.props.labelStyle]}>
            {this.props.label}:{' '}
          </Text>
        ) : null}
        <TouchableOpacity
          style={this.createToggleSwitchStyle()}
          activeOpacity={0.8}
          onPress={() => {
            this.props.onToggle(!this.props.isOn);
          }}
        >
          <Animated.View style={this.createInsideCircleStyle()}>
            {this.props.icon}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}
