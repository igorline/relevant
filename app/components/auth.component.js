import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard,
  Image,
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
      title: 'Login',
      showBackButton: true
    }, this.props.navigation.main);
  }

  signup() {
    this.props.actions.push({
      key: 'signup',
      title: 'Signup',
      showBackButton: true
    }, this.props.navigation.main);
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <View
        style={[
          { height: isAuthenticated ? this.state.visibleHeight - 60 : this.state.visibleHeight }, styles.authParent
        ]}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../assets/images/logo.png')} resizeMode={'contain'} style={{ width: 330, height: 100 }} />
        </View>

        <View style={styles.authDivider}>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 26 }}>
            <Text style={styles.strokeText}>Relevant</Text> is sit amet, consectetur adipiscing elit, eiusmod tempor incididunt <Text style={styles.strokeText}>labore et</Text> dolore magna aliqua ad minim.
          </Text>
        </View>

        <TouchableHighlight
          onPress={this.signup}
          style={styles.largeButton}
          underlayColor={'transparent'}
        >
          <Text style={styles.largeButtonText}>
            Sign Up Now
          </Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={{}}
          onPress={this.login}
          underlayColor={'transparent'}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={{ color: '#3E3EFF' }}>Sign In.</Text>
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  authDivider: {
    height: 5,
    marginTop: 20,
    marginBottom: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderTopColor: 'black',
  },
  authParent: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 20
  },
  signInText: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontSize: 18,
  }
});

styles = { ...localStyles, ...globalStyles };

export default Auth;

