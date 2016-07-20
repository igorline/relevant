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
  Easing
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
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

  componentWillUpdate(next) {
    var self = this;
  }


  componentDidMount() {
    var self = this;
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (!self.props.auth.user && next.auth.user) {
      self.props.actions.userToSocket(next.auth.user);
      self.props.actions.getActivity(next.auth.user._id, 0);
      self.props.actions.getGeneralActivity(next.auth.user._id, 0);
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
      StatusBarIOS.setStyle('light-content');
      navEl = (<View style={styles.nav}>
        <View style={[styles.navItem]}>
          <Text style={[styles.navLink, styles.maxWidth]} numberOfLines={1}>{title}</Text>
        </View>
         {route == 'Profile' ? <View style={styles.gear}><TouchableHighlight onPress={self.props.routes.ProfileOptions} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View> : null}
         {statsEl}

      </View>);
    } else {
      StatusBarIOS.setStyle('default');
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
    animation: state.animation
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...onlineActions, ...notifActions, ...animationActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav)

const localStyles = StyleSheet.create({
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
    backgroundColor: 'black'
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
    color: 'white'
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  maxWidth: {
    width: fullWidth/1.25,
  }
});

var styles = {...localStyles, ...globalStyles};

