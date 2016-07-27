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
  PushNotificationIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Nav extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentAppState: AppState.currentState,
      investAni: [],
    }
  }

  componentDidMount() {
    var self = this;
    StatusBarIOS.setStyle('default');
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  componentDidReceiveProps(prev) {
    // if (prev.auth.isAuthenticated && !self.props.auth.isAuthenticated) {
    //       var user = prev.auth.user;
    //       var newUser = prev.auth.user;
    //       console.log('removing device');
    //         if (user.deviceTokens) {
    //             if (user.deviceTokens.indexOf(deviceToken) > -1) {
    //                 console.log('removing device', deviceToken);
    //                 var index = user.deviceTokens.indexOf(deviceToken);
    //                 var spliced = user.deviceTokens.splice(index, 1);
    //                 console.log(newUser.deviceTokens, 'pre splice')
    //                 newUser.deviceTokens = spliced;
    //                 console.log(newUser.deviceTokens, 'post splice');
    //                 self.props.actions.updateUser(newUser, prev.auth.token);
    //             } else {
    //               console.log('user doesnt have token selected for removal');
    //             }
    //         } else {
    //           console.log('no user tokens to remove');
    //         }
    //     }
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (!self.props.auth.user && next.auth.user) {
      self.props.actions.userToSocket(next.auth.user);
      self.props.actions.getActivity(next.auth.user._id, 0);
      self.props.actions.getGeneralActivity(next.auth.user._id, 0);
    }

    // if (self.props.auth.isAuthenticated != next.auth.isAuthenticated) {
    //   console.log('componentWillReceiveProps', self.props.auth.isAuthenticated, next.auth.isAuthenticated)
    //   if (next.auth.isAuthenticated) {
    //     console.log(next.auth.user)
    //     self.props.actions.addDeviceToken(next.auth.user, next.auth.token)
    //   }
    // }
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

  changeView(route, view) {
    var self = this;
    self.props.actions.setView(route, view);
  }

  render() {
    var self = this;
    var authenticated = this.props.auth.isAuthenticated;
    var navEl = null;
    var title = '';
    var statsEl = null;
    var route = self.props.route.name;
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
      statsEl = (<View style={styles.stats}>
          <Text style={styles.statsTxt}>📈<Text style={styles.active}>{relevance}</Text>  💵<Text style={styles.active}>{balance}</Text></Text>
        </View>
      )
    }

    switch(route) {
      case 'Profile':
        self.props.auth.user ? title = self.props.auth.user.name : title = self.props.title;
        break;

      case 'SinglePost':
        self.props.posts.activePost.title ? title = self.props.posts.activePost.title : title = 'Untitled Post';
        break;

      case 'User':
        self.props.users.selectedUser ? title = self.props.users.selectedUser.name : title = self.props.title;
        break;

      case 'CreatePost':
        title = 'Post';
        break;

      default:
        title = self.props.title;
    }

    if (authenticated) {
      //StatusBarIOS.setStyle('light-content');
      navEl = (<View style={styles.nav}>
        <View style={[styles.navItem]}>
          <Text style={[styles.navLink, styles.maxWidth]} numberOfLines={1}>{title}</Text>
        </View>
         {route == 'Profile' ? <View style={styles.gear}><TouchableHighlight onPress={self.props.routes.ProfileOptions} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View> : null}
         {route == 'Read' && self.props.view.read == 2 ? <TouchableHighlight onPress={self.changeView.bind(self, 'read', 1)} style={styles.back}><Text style={styles.backText}>{'<'}</Text></TouchableHighlight> : null}
         {statsEl}

      </View>);
    } else {
      //StatusBarIOS.setStyle('default');
    }

    return (
      <View>
        {navEl}
      </View>
    );
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
    view: state.view
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...onlineActions, ...notifActions, ...animationActions, ...viewActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav)

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
  backText: {
    color: 'black',
    fontSize: 20
  },
  gear: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 60,
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12
  },
  gearImg: {
    height: 25,
    width: 25
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)',
    borderBottomStyle: 'solid'
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
    color: 'black'
  },
  navItem: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    color: 'black',
    backgroundColor: 'transparent',
    fontSize: 20,
    textAlign: 'center',
  },
  maxWidth: {
    width: fullWidth/1.25,
  }
});

var styles = {...localStyles, ...globalStyles};

