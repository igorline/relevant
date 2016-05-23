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
  AppState,
  Dimensions,
  ScrollView,
  DeviceEventEmitter
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
    this.props.actions.getUser();
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
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
        <View style={styles.alignAuth}>
          <Text style={styles.font20}>{user ? user.name : null}</Text>
        </View>
      );
    }
    else if (currentRoute == 'LogIn') {
      auth = (
        <View style={styles.alignAuth}>
          <Login { ...this.props } styles={styles} />
        </View>
      );
      links = (
        <View style={styles.alignAuth}>
          <Button onPress={self.props.routes.SignUp} >Sign Up</Button>
        </View>
      );
      tagline = 'Stay Relevant \n Log in'
    } else if (currentRoute == 'SignUp') {
      auth = (<View style={styles.alignAuth}>
        <SignUp {...this.props} styles={styles} />
      </View>);
      tagline = 'Get Relevant \n Sign up';
      links = (
        <View style={styles.alignAuth}>
          <Button onPress={self.props.routes.LogIn} >Log In</Button>
        </View>
      );
    } else {
      tagline = 'Relevant';
      links = (
        <View style={styles.alignAuth}>
          <Button onPress={self.props.routes.LogIn} >Log In</Button>
          <Button onPress={self.props.routes.SignUp} >Sign Up</Button>
        </View>
        );
    }

    return (
      <View style={{height: isAuthenticated ? self.state.visibleHeight - 120 : self.state.visibleHeight}}>
        <ScrollView contentContainerStyle={styles.authScroll}>
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
        </ScrollView>
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
    alignItems: 'center'
  }
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

