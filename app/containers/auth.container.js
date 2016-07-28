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
  DeviceEventEmitter,
  TouchableHighlight
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
    this.props.actions.getUser(null, true);
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

    if (isAuthenticated){
      auth = (
        <View style={styles.alignAuth}>
          <Text style={[styles.font20, styles.darkGray]}>{user ? user.name : null}</Text>
          <Text style={styles.darkGray}>{message}</Text>
        </View>
      );
    }

   if (currentRoute == 'LogIn') {
      auth = (
        <View style={styles.alignAuth}>
        <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
            Stay Relevant {'\n'} Log in
          </Text>
          <Login { ...this.props } styles={styles} />
           <TouchableHighlight onPress={self.props.routes.Auth} style={[styles.whiteButton]}><Text style={styles.buttonText}>Back</Text></TouchableHighlight>
        </View>
      );
    }

    if (currentRoute == 'SignUp') {
      auth = (<View style={styles.alignAuth}>
        <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>
            Get Relevant {'\n'} Sign up
          </Text>
        <SignUp {...this.props} styles={styles} />
        <TouchableHighlight style={[styles.whiteButton]} onPress={self.props.routes.Auth}><Text style={styles.buttonText}>Back</Text></TouchableHighlight>
      </View>);
    }

    if (currentRoute == 'Auth') {
      auth = (
        <View style={styles.alignAuth}>
          <Text style={[styles.textCenter, styles.font20, styles.darkGray]}>Relevant</Text>
          <Text style={styles.darkGray}>{message}</Text>
          <TouchableHighlight style={[styles.whiteButton]} onPress={self.props.routes.LogIn}><Text style={styles.buttonText}>Log In</Text></TouchableHighlight>
          <TouchableHighlight style={[styles.whiteButton, styles.marginTop]} onPress={self.props.routes.SignUp}><Text style={styles.buttonText}>Sign Up</Text></TouchableHighlight>
        </View>
      )
    }

    return (
      <View style={[{height: isAuthenticated ? self.state.visibleHeight - 120 : self.state.visibleHeight, backgroundColor: '#F0F0F0'}]}>
        {auth}
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
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

