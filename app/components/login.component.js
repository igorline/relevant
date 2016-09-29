'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  TouchableHighlight,
  AlertIOS,
  Dimensions,
  Keyboard,
  DeviceEventEmitter
} from 'react-native';
import Button from 'react-native-button';
import {reduxForm} from 'redux-form';
import Notification from './notification.component';
import { globalStyles } from '../styles/global';

class Login extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      bool: false,
      notifText: null,
      email: null,
      password: null,
      visibleHeight: Dimensions.get('window').height
    }
  }

  componentDidMount() {
    var self = this;
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.setAuthStatusText();
    this.showListener.remove();
    this.hideListener.remove();
  }

  componentWillUpdate(nextProps, nextState) {
    var self = this;
    if (nextProps.auth.statusText && !self.props.auth.statusText) {
       AlertIOS.alert(nextProps.auth.statusText);
    }
  }

 keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height)
    this.setState({visibleHeight: newSize})
  }

  keyboardWillHide (e) {
    this.setState({visibleHeight: Dimensions.get('window').height})
  }

  login() {
    var self = this;
    this.props.actions.loginUser({email: self.state.email, password: self.state.password}).then(function(results) {
      console.log(results, 'results')
    })
  }

  back() {
    var self = this;
    self.props.navigator.pop(0);
  }

  render() {
    var self = this;
    var styles = globalStyles;
    const { loginUser } = this.props.actions;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;

    return (
      <View style={[{height: self.state.visibleHeight, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center'}]}>
        <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
            Stay Relevant {'\n'} Log in
        </Text>
        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' keyboardType='default' clearTextOnFocus={false} placeholder="email" onChangeText={(email) => this.setState({"email": email})} value={this.state.email} style={styles.authInput} />
        </View>

        <View style={styles.marginTop}>
          <TextInput autoCapitalize='none' secureTextEntry={true} keyboardType='default' clearTextOnFocus={false} placeholder="password" onChangeText={(password) => this.setState({"password": password})} value={this.state.password} style={styles.authInput} />
        </View>

        <View style={styles.margin}>
          <TouchableHighlight onPress={self.login.bind(this)} style={[styles.whiteButton]}><Text style={styles.buttonText}>Submit</Text></TouchableHighlight>
        </View>

         <TouchableHighlight onPress={self.back.bind(self)} style={[styles.whiteButton]}><Text style={styles.buttonText} >Back</Text></TouchableHighlight>
      </View>
    );
  }
}


export default Login


