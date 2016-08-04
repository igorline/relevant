'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  StatusBarIOS,
  TouchableHighlight,
  AppState,
  Animated,
  Easing,
  PushNotificationIOS,
  ActionSheetIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Nav extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentAppState: AppState.currentState,
      buttons: [
        'Change display name',
        'Add new photo',
        'Logout',
        'Cancel'
      ],
      destructiveIndex: 2,
      cancelIndex: 3,
    }
  }

  logoutRedirect() {
    var self = this;
    self.props.actions.removeDeviceToken(self.props.auth);
    self.props.actions.logoutAction(self.props.auth.user, self.props.auth.token);
    self.props.view.nav.replace(1);
  }

  showActionSheet() {
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: self.state.buttons,
      cancelButtonIndex: self.state.cancelIndex,
      destructiveButtonIndex: self.state.destructiveIndex,
    },
    (buttonIndex) => {
      switch(buttonIndex) {
          case 0:
              // self.onShare();
              break;
          case 1:
              // self.irrelevant();
              break;
          case 2:
              self.logoutRedirect();
              break;
          default:
              return;
      }
    });
  }

  back() {
    var self = this;
    self.props.view.nav.pop()
  }

  changeView(route, view, category) {
    var self = this;
    self.props.actions.setView(route, view);
  }

  render() {
    var self = this;
    var Actions = this.props.routes;
    var authenticated = this.props.auth.isAuthenticated;
    var navEl = null;
    var title = '';
    var statsEl = null;
    var route = null;
    var relevance = 0;
    var balance = 0;
    var user = null;
    var routes = null;
    if (self.props.view.route) {
      route = self.props.view.route;
    }
    if (self.props.view.nav) {
      routes = self.props.view.nav.getCurrentRoutes();
    }
    if (self.props.auth.user) {
      user = self.props.auth.user;
      if (user.relevance) relevance = user.relevance;
      if (user.balance) balance = user.balance;
      if (balance > 0) balance = balance.toFixed(0);
      if (relevance > 0) relevance = relevance.toFixed(0);
    }

    if (self.props.auth.user) {
      statsEl = (<View style={styles.stats}>
          <Text style={styles.statsTxt}>📈<Text style={styles.active}>{relevance}</Text>  💵<Text style={styles.active}>{balance}</Text></Text>
        </View>
      )
    }

    switch(route) {
      case 2:
        title = 'Log In';
        break;

      case 3:
        title = 'Sign Up';
        break;

      case 4:
        self.props.auth.user ? title = self.props.auth.user.name : 'User';
        break;

      case 5:
        title = 'Activity';
        break;

      case 13:
        self.props.posts.activePost.title ? title = self.props.posts.activePost.title : title = 'Untitled Post';
        break;

      case 11:
        self.props.users.selectedUser ? title = self.props.users.selectedUser.name : title = '';
        break;

      case 6:
          title = 'Post';
        break;

      case 7:
          title = 'Categories';
        break;

      case 8:
          title = 'Discover';
        break;

      case 9:
          title = 'Read';
        break;

      default:
        title = '';
    }

    if (self.props.view.name) title = self.props.view.name;

    if (authenticated) {
      navEl = (<View style={styles.nav}>
        <View style={[styles.navItem]}>
          <Text style={[styles.navLink, styles.maxWidth, styles.darkGray]} numberOfLines={1}>{title}</Text>
        </View>

         {self.props.view.back ? <TouchableHighlight underlayColor={'transparent'}  onPress={self.back.bind(self)} style={styles.back}><View style={styles.backInner}><Image style={styles.backImg} source={require('../assets/images/back.png')} /><Text style={styles.backText}>Back</Text></View></TouchableHighlight> : null}

         {route != 4 ? statsEl : <View style={styles.gear}><TouchableHighlight underlayColor={'transparent'}  onPress={self.showActionSheet.bind(self)} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View>}
      </View>);
    }

    return (
      <View>
        {navEl}
      </View>
    );
  }
}

export default Nav

const localStyles = StyleSheet.create({
  back: {
    position: 'absolute',
    top: 0,
    left: 5,
    height: 60,
    padding: 12,
    flex: 1,
    justifyContent: 'flex-end'
  },
  backInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backImg: {
    height: 10,
    width: 7,
    backgroundColor: 'transparent',
    marginRight: 4
  },
  backText: {
    color: '#aaaaaa',
    fontSize: 12
  },
  gear: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 60,
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12
  },
  gearImg: {
    height: 20,
    width: 20
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)'
  },
  stats: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  statsTxt: {
    color: 'black',
    fontSize: 10
  },
  navItem: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    backgroundColor: 'transparent',
    fontSize: 15,
    textAlign: 'center',
  },
  maxWidth: {
    width: fullWidth/1.25,
  }
});

var styles = {...localStyles, ...globalStyles};

