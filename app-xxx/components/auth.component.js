'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard,
  NavigationExperimental
} from 'react-native';

const { CardStack: NavigationCardStack } = NavigationExperimental;
import { connect } from 'react-redux';
import Button from 'react-native-button';
import Login from '../components/login.component';
import SignUp from '../components/signup.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../styles/global';


import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';
import * as navigationActions from '../actions/navigation.actions';

let styles;

class Auth extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      visibleHeight: Dimensions.get('window').height
    }
  }

  keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height)
    this.setState({visibleHeight: newSize})
  }

  keyboardWillHide (e) {
    this.setState({visibleHeight: Dimensions.get('window').height})
  }

  componentDidMount() {
    var self = this;
    this.props.actions.getUser(null, true);
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  login() {
    this.props.actions.push({
      key: 'login',
      title: 'Login',
      back: true
    });
  }

  signup() {
    this.props.actions.push({
      key: 'signup',
      title: 'Signup',
      back: true
    });
  }

  componentDidUpdate(prev) {
    var self = this;
  }

  render() {
    var self = this;
    var auth;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;
    const { isAuthenticated, user } = this.props.auth;
    const { logout } = this.props.actions;
    const { actions } = this.props;
    var tagline = '';
    var links = null;

    return (
      <View style={[
          { height: isAuthenticated ? self.state.visibleHeight - 60 : self.state.visibleHeight,
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
            onPress={self.login.bind(self)}
          >
            <Text style={styles.buttonText}>
              Log In
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={self.signup.bind(self)}
            style={[styles.whiteButton, styles.marginTop]}
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
// function mapStateToProps(state) {
//   return {
//     auth: state.auth,
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators(
//       {
//         ...authActions,
//         ...navigationActions,
//       }, dispatch),
//   };
// }


// export default connect(mapStateToProps, mapDispatchToProps)(Auth);


