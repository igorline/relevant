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
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Dollar from './dollar.component';

class InvestAnimation extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      investAni: [],
      num: 0
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

  componentWillUnmount() {
    var self = this;
    self.clearEls();
    //self.setState({investAni: []})
  }

  clearEls() {
    var self = this;
    console.log('clearEls');
    if (self.state.num > 0) self.setState({num: 0, investAni: []});
  }

  investAni() {
    var styles = {...globalStyles, ...localStyles};
    var self = this;
    if (self.state.num < 25) {
      var newArr = self.state.investAni;
      newArr.push(<Dollar key={self.state.num} />);
      var newNum = self.state.num += 1;
      self.setState({num: newNum, investAni: newArr});
    }
    setTimeout(function() { self.investAni() }, 100);
  }

  render() {
    var self = this;

    return (
      <View style={{position: 'absolute', top: 0, right: 0, height: 20, width: 20}}>
        {self.state.investAni}
      </View>
    );
  }
}

export default InvestAnimation;

const localStyles = StyleSheet.create({
  aniMoney: {
    position: 'absolute',
    top: -35,
    right: 10,
    backgroundColor: 'transparent'
  },
});






