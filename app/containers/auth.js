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

import { connect } from 'react-redux';
var Button = require('react-native-button');
import Login from '../components/login';
import SignUp from '../components/signup';
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../styles/global';

class Auth extends Component {
  componentDidMount() {
    //this.props.actions.loginJay();
    this.props.actions.getUser();
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
          <Text style={styles.font20}>{user ? user.name : null}</Text>
        </View>
      );
    }
    else if (currentRoute == 'LogIn') {
      auth = (
        <View style={styles.center}>
          <Login { ...this.props } styles={styles} />
        </View>
      );
      links = (
        <View style={styles.center}>
          <Button onPress={self.props.routes.SignUp} >Sign Up</Button>
        </View>
      );
      tagline = 'Stay Relevant \n Log in'
    } else if (currentRoute == 'SignUp') {
      auth = (<View style={styles.center}>
        <SignUp {...this.props} styles={styles} />
      </View>);
      tagline = 'Get Relevant \n Sign up';
      links = (
        <View style={styles.center}>
          <Button onPress={self.props.routes.LogIn} >Log In</Button>
        </View>
      );
    } else {
      tagline = 'Relevant';
      links = (
        <View style={styles.center}>
          <Button onPress={self.props.routes.LogIn} >Log In</Button>
          <Button onPress={self.props.routes.SignUp} >Sign Up</Button>
        </View>
        );
    }

    return (
      <View style={styles.container}>
        <Text style={[styles.center, styles.font20]}>
          {tagline}
        </Text>
        <Text>
          {message}
        </Text>
        {auth}
        {links}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
});

var styles = {...localStyles, ...globalStyles};

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth)

