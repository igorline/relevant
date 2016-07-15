import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Picker,
  ListView,
  Animated,
  Easing,
  RecyclerViewBackedScrollView
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

module.exports = {
  investAni: function(parent) {
    var styles = {...globalStyles};
    for (var i = 0; i < 21; i++) {
      var values = {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(1.5),
        opacity: new Animated.Value(1)
      };
      parent.state.investAni.push(<Animated.Text style={[styles.aniMoney, {transform: [{translateX: values.x}, {scale: values.scale}, {translateY: values.y}], opacity: values.opacity}]}>💵</Animated.Text>);

      Animated.timing(values.x, {
        toValue: -(fullWidth/2),
        delay: i*100,
        duration: 500,
        easing: Easing.linear
      }).start();

      Animated.timing(values.y, {
        toValue: fullHeight*0.1,
        delay: i*100,
        duration: 500,
        easing: Easing.linear
      }).start();

      Animated.timing(values.opacity, {
        toValue: 0,
        delay: i*100,
        duration: 500,
        easing: Easing.linear
      }).start();

      Animated.timing(values.scale, {
        toValue: 5,
        delay: i*100,
        duration: 500,
        easing: Easing.linear
      }).start();
    }
    parent.setState({})
  }
};