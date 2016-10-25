'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated,
  Easing
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Dollar extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(1.5),
      opacity: new Animated.Value(1)
    }
  }

  componentDidMount() {
    var self = this;
    var i = self.props.specialKey;
    
    Animated.timing(self.state.x, {
      toValue: -(fullWidth/2),
      delay: i*100,
      duration: 500,
      easing: Easing.linear
    }).start();

    Animated.timing(self.state.y, {
      toValue: fullHeight*0.1,
      delay: i*100,
      duration: 500,
      easing: Easing.linear
    }).start();

    Animated.timing(self.state.opacity, {
      toValue: 0,
      delay: i*100,
      duration: 500,
      easing: Easing.linear
    }).start();

    Animated.timing(self.state.scale, {
      toValue: 5,
      delay: i*100,
      duration: 500,
      easing: Easing.linear
    }).start();
  }

  componentWillUnmount() {
    var self = this;
  }

  render() {
    var self = this;
    var specialKey = self.props.specialKey;
    var styles = localStyles;

    return (
      <Animated.Text key={specialKey} style={[styles.aniMoney, {transform: [{translateX: self.state.x}, {scale: self.state.scale}, {translateY: self.state.y}], opacity: self.state.opacity}]}>💵</Animated.Text>
    );
  }
}

export default Dollar;

const localStyles = StyleSheet.create({
  aniMoney: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: 'transparent'
  },
});






