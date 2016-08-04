'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  TouchableHighlight
} from 'react-native';
var Button = require('react-native-button');
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
      password: null
    }
  }

  componentDidMount() {
  }

   componentDidUpdate(prev) {
    var self = this;
    if (!prev.auth.user && self.props.auth.user) {
      //self.props.view.nav.replace(4)
    }
  }

  login() {
    var self = this;
    this.props.actions.loginUser({email: self.state.email, password: self.state.password}).then(function(results) {
      console.log(results, 'results')
    })
  }

  back() {
    var self = this;
    self.props.view.nav.pop(0);
  }

  render() {
    var self = this;
    var styles = globalStyles;
    const { loginUser } = this.props.actions;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;

    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0'}}>
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

         <TouchableHighlight style={[styles.whiteButton]}><Text style={styles.buttonText} onPress={self.back.bind(self)}>Back</Text></TouchableHighlight>

      </View>
    );
  }
}


export default Login


