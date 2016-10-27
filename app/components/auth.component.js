import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard,
} from 'react-native';

import { globalStyles } from '../styles/global';

let styles;

class Auth extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visibleHeight: Dimensions.get('window').height
    };
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height });
  }


  login() {
    this.props.actions.push({
      key: 'login',
      title: 'Item details',
      showBackButton: true
    }, this.props.navigation.key);
  }

  signup() {
    this.props.actions.push({ key: 'signup' });
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <View
        style={[
        { height: isAuthenticated ? this.state.visibleHeight - 60 : this.state.visibleHeight,
          backgroundColor: '#F0F0F0' }]}
      >
        <View style={styles.alignAuth}>
          <Text
            style={[
              styles.textCenter,
              styles.font20,
              styles.darkGray,
              { marginBottom: 10 }]}
          >
            Relevant
          </Text>
          <TouchableHighlight
            style={[styles.whiteButton]}
            onPress={this.login}
            underlayColor={'transparent'}
          >
            <Text style={styles.buttonText}>
              Log In
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this.signup}
            style={[styles.whiteButton, styles.marginTop]}
            underlayColor={'transparent'}
          >
            <Text style={styles.buttonText}>
              Sign Up
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  authScroll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alignAuth: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  }
});

styles = { ...localStyles, ...globalStyles };

export default Auth;

