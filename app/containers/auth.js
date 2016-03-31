'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
} from 'react-native';

import {
  Route,
  Router,
  Schema,
  TabBar,
  TabRoute
} from 'react-native-router-redux';


import { connect } from 'react-redux';
var Button = require('react-native-button');
import Login from '../components/login';
import FbButton from '../components/fb';
import SignUp from '../components/signup';
import * as authActions from '../actions/authActions';
import { bindActionCreators } from 'redux';

class Auth extends Component {
  componentDidMount() {
    this.props.actions.loginJay();
  }

  render() {
    var self = this;
    var auth;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;
    const { isAuthenticated, user } = this.props.auth;
    const { logout } = this.props.actions;
    const { actions } = this.props;
    const { currentRoute } = this.props.router;
    var message = '';
    this.props.auth.statusText ? message = this.props.auth.statusText : null;
    var tagline = '';
    var links = null;
    var userImage = null;
    if (user) {
      if (this.props.auth.user.image) {
        userImage = this.props.auth.user.image;
      }
    }

    if(isAuthenticated){
      auth = (
        <View style={styles.center}>
          <Text style={styles.welcome}>{user ? user.name : null}</Text>
          {userImage ? <Image source={{uri: userImage}} style={styles.uploadAvatar} /> : null}
          <Button onPress={actions.routes.Profile()}>Update profile</Button>
          <Button onPress={actions.routes.Import()}>Import page</Button>
          <Button onPress={logout}>Logout</Button>
        </View>
      );
    }
    else if (currentRoute == 'LogIn') {
      auth = (
        <View style={styles.center}>
          <Login { ...this.props }/>
        </View>
      );
      links = (
        <View style={styles.center}>
          <Button onPress={actions.routes.SignUp()} >Sign Up</Button>
        </View>
      );
      tagline = 'Stay Relevant \n Log in'
    } else if (currentRoute == 'SignUp') {
      auth = (<View style={styles.center}>
        <SignUp {...this.props} />
      </View>);
      tagline = 'Get Relevant \n Sign up';
      links = (
        <View style={styles.center}>
          <Button onPress={actions.routes.LogIn()} >Log In</Button>
        </View>
      );
    } else {
      tagline = 'Relevant';
      links = (
        <View style={styles.center}>
          <Button onPress={actions.routes.LogIn()} >Log In</Button>
          <Button onPress={actions.routes.SignUp()} >Sign Up</Button>
        </View>
        );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {tagline}
        </Text>
        <Text style={styles.instructions}>
          {message}
        </Text>

        {auth}

        {links}
        {currentRoute != 'Auth' ?  <Button onPress={actions.routes.Auth()}>Home</Button> : null}
      </View>
    );
  }
}
export default Auth

const styles = StyleSheet.create({
  uploadAvatar: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  }
});

