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
import { connect } from 'react-redux';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var moment = require('moment');

class InvestAnimation extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      investAni: []
    }
  }

  componentDidUpdate(prev) {
    var self = this;
    if (self.props.animation != prev.animation) {
      if (self.props.animation.bool && self.props.animation.run) {
        if (self.props.animation.type == 'invest') {
          self.investAni();
        }
      }
    }
  }

  investAni() {
    var styles = {...globalStyles};
    var self = this;
    if (self.props.animation.run) {
      for (var i = 0; i < 1; i++) {
        var values = {
          x: new Animated.Value(0),
          y: new Animated.Value(0),
          scale: new Animated.Value(1.5),
          opacity: new Animated.Value(1)
        };

        self.state.investAni.push(<Animated.Text style={[styles.aniMoney, {transform: [{translateX: values.x}, {scale: values.scale}, {translateY: values.y}], opacity: values.opacity}]}>💵</Animated.Text>);

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

        self.setState({})
      }

      setTimeout(function() {
        self.investAni();
      }, 50);
    }
  }

  render() {
    var self = this;

    return (
        <View style={{position: 'absolute', top: 0, right: 0}}>
          {self.state.investAni}
        </View>
    );
  }
}

export default InvestAnimation;

const localStyles = StyleSheet.create({
});






