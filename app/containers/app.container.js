'use strict';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  StatusBarIOS,
  AppState,
  Navigator,
  TouchableHighlight,
  ActionSheetIOS,
  Image
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var Button = require('react-native-button');
import Auth from './auth.container';
import Import from './import.container';
import Profile from './profile.container';
import Notification from '../components/notification.component';
import Login from '../components/login.component';
import Signup from '../components/signup.component';
import Categories from '../components/categories.component';
import Read from './read.container';
import Footer from './footer.container';
import CreatePost from './createPost.container';
import Discover from './discover.container';
import SinglePost from './singlePost.container';
import User from './user.container';
import Activity from './activity.container';
import Comments from './comments.container';
import Messages from './messages.container';
import Thirst from './thirst.container';
import InvestAnimation from '../components/investAnimation.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';

class Application extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      nav: null,
      route: null,
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

  componentDidMount() {
    var self = this;
    StatusBarIOS.setStyle('default');
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (!self.props.auth.user && next.auth.user) {
      self.props.actions.userToSocket(next.auth.user);
      self.props.actions.getActivity(next.auth.user._id, 0);
      self.props.actions.getGeneralActivity(next.auth.user._id, 0);
      self.props.actions.getMessages(next.auth.user._id);
      self.props.view.nav.replace(4)
    }
  }

  componentWillUnmount() {
    var self = this;
    AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  }

  handleAppStateChange(currentAppState) {
    var self = this;
    if (currentAppState == 'active' && self.props.auth.user) {
        self.props.actions.userToSocket(self.props.auth.user);
        self.props.actions.getActivity(self.props.auth.user._id, 0);
        self.props.actions.getGeneralActivity(self.props.auth.user._id, 0);
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

  routeFunction(route, nav) {
    var self = this;
    if (self.props.view.nav != nav || self.props.view.route != route) self.props.actions.setNav(nav, route);
    switch(route) {
      case 0:
        return <Auth { ...self.props } navigator={nav} />;
        break
      case 1:
        return <Auth { ...self.props } navigator={nav} />;
        break
      case 2:
        return <Login { ...self.props } navigator={nav} />;
        break
      case 3:
        return <Signup { ...self.props } navigator={nav} />;
        break
      case 4:
        return <Profile { ...self.props } navigator={nav} />;
        break
      case 5:
        return <Activity { ...self.props } navigator={nav} />;
        break
      case 6:
        return <CreatePost { ...self.props } navigator={nav} />;
        break
      case 7:
        return <Categories { ...self.props } navigator={nav} />;
        break
      case 8:
        return <Discover { ...self.props } navigator={nav} />;
        break
      case 9:
        return <Read { ...self.props } navigator={nav} />;
        break
      case 10:
        return <Comments { ...self.props } navigator={nav} />;
        break
      case 11:
        return <User { ...self.props } navigator={nav} />;
        break
      case 12:
        return <Thirst { ...self.props } navigator={nav} />;
        break
      case 13:
        return <SinglePost { ...self.props } navigator={nav} />;
        break
      case 14:
        return <Messages { ...self.props } navigator={nav} />;
        break
      default:
        return <Auth { ...self.props } navigator={nav} />;
    }
  }

  left(route, navigator, index, navState) {
    var self = this;
    if (route == 14 || route == 13 || route == 10 || route == 7 || route == 2 || route == 3 ) {
      return (<TouchableHighlight underlayColor={'transparent'} style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10}} onPress={self.back.bind(self, navigator)}><Text>Back</Text></TouchableHighlight>);
    } else {
      return null;
    }
  }

  right(route, navigator, index, navState) {
    var self = this;
    var statsEl = null;
    var relevance = 0;
    var balance = 0;
    var user = null;
    if (self.props.auth.user) {
      user = self.props.auth.user;
      if (user.relevance) relevance = user.relevance;
      if (user.balance) balance = user.balance;
      if (balance > 0) balance = balance.toFixed(0);
      if (relevance > 0) relevance = relevance.toFixed(0);
    }
    if (self.props.auth.user) {
      statsEl = (<View><Text style={styles.statsTxt}>📈<Text style={styles.active}>{relevance}</Text>  💵<Text style={styles.active}>{balance}</Text></Text></View>
      )
    }
    if (route != 4) {
      return (<View style={{flex: 1, justifyContent: 'center', padding: 10}}>{statsEl}</View>);
    } else {
      return (<View style={styles.gear}><TouchableHighlight underlayColor={'transparent'}  onPress={self.showActionSheet.bind(self)} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View>);
    }
  }

  title(route, navigator, index, navState) {
    var self = this;
    var title = self.getTitle(route);
    return (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text>{title}</Text></View>);
  }

  back(nav) {
    var self = this;
    nav.pop();
  }

  getTitle(route) {
    var self = this;
    var title = '';
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
    return title;
  }

  render() {
    var self = this;
    if (self.props.auth.user) {
      return (
        <View style={{flex: 1}}>
          <Navigator
            renderScene={(route, navigator) =>
              self.routeFunction(route, navigator)
            }
            style={{flex: 1, paddingTop: 64}}
            navigationBar={
              <Navigator.NavigationBar
                routeMapper={{
                  LeftButton: (route, navigator, index, navState) =>
                    { return self.left(route, navigator, index, navState) },
                  RightButton: (route, navigator, index, navState) =>
                    { return self.right(route, navigator, index, navState) },
                  Title: (route, navigator, index, navState) =>
                    { return self.title(route, navigator, index, navState) },
                }}
                style={{backgroundColor: 'white', borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth }}
              />
            }
          />
          <Footer {...self.props} navigator={self.state.nav} route={self.state.route} />
          <View pointerEvents={'none'} style={globalStyles.notificationContainer}>
            <Notification {...self.props} />
          </View>
          <InvestAnimation {...self.props} />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1}}>
          <Navigator
            renderScene={(route, navigator) =>
              self.routeFunction(route, navigator)
            }
            style={{flex: 1, paddingTop: 0}}
          />
          <Footer {...self.props} navigator={self.state.nav} route={self.state.route} />
          <View pointerEvents={'none'} style={globalStyles.notificationContainer}>
            <Notification {...self.props} />
          </View>
          <InvestAnimation {...self.props} />
        </View>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer,
    online: state.online,
    notif: state.notif,
    animation: state.animation,
    view: state.view,
    messages: state.messages
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...onlineActions, ...notifActions, ...animationActions, ...viewActions, ...messageActions, ...tagActions, ...userActions, ...investActions}, dispatch)
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Application)

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
    // position: 'absolute',
    // top: 0,
    // right: 0,
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

