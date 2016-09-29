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
  Animated
} from 'react-native';
import { connect } from 'react-redux';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import * as notifActions from '../actions/notif.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Notification extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      notifOpac: new Animated.Value(0),
      active: false
    }
  }

  componentDidUpdate() {
    var self = this;
    if (this.props.notif.active && !self.state.active) {
      console.log('active notif')
      self.setState({active: true});
      this.flashNotif();
      setTimeout(function() {
        self.props.actions.setNotif(false, null, false);
        self.setState({active: false});
      }, 2000);
    }
  }

  flashNotif() {
    var self = this;
     Animated.timing(
       self.state.notifOpac,
       {toValue: 1}
     ).start();
    setTimeout(function() {
       Animated.timing(
       self.state.notifOpac,
       {toValue: 0}
     ).start();
    }, 1000);
  }


  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var styles = {...localStyles, ...parentStyles};
    var message = this.props.notif.text;
    var bool = self.props.notif.bool;

    return (
      <Animated.View style={[styles.parent, bool ? styles.green : styles.red, {opacity: self.state.notifOpac}]}>
        <Text style={styles.notifText}>{message}</Text>
      </Animated.View>
    );
  }
}

export default Notification

const localStyles = StyleSheet.create({
parent: {
  width: fullWidth,
  padding: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
notifText: {
  color: 'white',
  fontSize: 20,
},
red: {
  backgroundColor: 'red'
},
green: {
  backgroundColor: 'green'
}
});






