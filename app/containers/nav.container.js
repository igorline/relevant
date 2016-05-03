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
  AppState
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as onlineActions from '../actions/online.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Nav extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentAppState: AppState.currentState,
    }
  }

  componentDidMount() {
    var self = this;
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  componentWillReceiveProps(next) {
    var self = this;

    if (self.props.auth.user != next.auth.user) {
      self.props.actions.userToSocket(next.auth.user)
    }
  }

  componentWillUnmount() {
    var self = this;
    AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  }

  handleAppStateChange(currentAppState) {
    var self = this;

    console.log('hello', currentAppState, self.props.auth.user)
    if (currentAppState == 'active' && self.props.auth.user) {
        console.log('send user to socket', self.props.auth.user.name);
        self.props.actions.userToSocket(self.props.auth.user)
    }
  }


  render() {
    var self = this;
    var authenticated = this.props.auth.isAuthenticated;
    var navEl = null;
    var title = '';
    var route = self.props.route.name;

    if (route == 'Profile') {
      if (self.props.auth.user) {
        title = self.props.auth.user.name;
      } else {
        title = self.props.title;
      }
    } else if (route == 'SinglePost') {
      if (self.props.posts.activePost.title) {
        title = self.props.posts.activePost.title;
      } else {
        title = 'Untitled Post';
      }
    } else if (route == 'User') {
      if (self.props.users.selectedUser) {
       title = self.props.users.selectedUser.name;
      } else {
        title = self.props.title;
      }
    } else if (route == 'CreatePost') {
      title = 'Post';
    } else {
      title = self.props.title;
    }

    if (authenticated) {
      StatusBarIOS.setStyle('light-content');
      navEl = (<View style={styles.nav}>
        <View style={[styles.navItem]}>
          <Text style={[styles.navLink, styles.maxWidth]} numberOfLines={1}>{title}</Text>
        </View>
         {route == 'Profile' ? <View style={styles.gear}><TouchableHighlight onPress={self.props.routes.ProfileOptions} ><Image style={styles.gearImg} source={require('../assets/images/gear.png')} /></TouchableHighlight></View> : null}
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
    online: state.online
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions, ...onlineActions }, dispatch)
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

