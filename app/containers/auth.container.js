'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Animated,
  AppState
} from 'react-native';

import { connect } from 'react-redux';
var Button = require('react-native-button');
import Login from '../components/login.component';
import SignUp from '../components/signup.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../styles/global';
// import '../utils/socketConfig';
// import io from 'socket.io-client/socket.io';
import Notification from '../components/notification.component';

class Auth extends Component {

  // constructor (props, context) {
  //   super(props, context)
  //    // this.socket = io('localhost:3000', {jsonp: false});
  //   this.state = {
  //     currentAppState: AppState.currentState,
  //   }
  // }

  // // getInitialState() {
  // //   return {

  // //   };
  // // }

  componentDidMount() {
    //var self = this;
    this.props.actions.getUser();
    //AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  // componentWillUnmount() {
  //   var self = this;
  //   AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  // }

  // handleAppStateChange(currentAppState) {
  //   var self = this;

  //   self.setState({ currentAppState: currentAppState});
  //   if (currentAppState == 'active' && self.props.auth.user) {
  //       console.log('send user to socket', self.props.auth.user.name);
  //      dispatch({type:'server/storeUser', payload: self.props.auth.user})
  //   }
  // }

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
        <Text style={[styles.textCenter, styles.font20]}>
          {tagline}
        </Text>
        <Text>
          {currentRoute == 'Auth' ? message : null}
        </Text>
        {auth}
        {links}
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
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
    router: state.routerReducer,
    notif: state.notif,
    socket: state.socket
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...notifActions }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth)

