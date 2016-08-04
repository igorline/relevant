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
  TouchableHighlight
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
import Nav from './nav.container';
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
import * as animationActions from '../actions/animation.actions';

class Application extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      nav: null,
      route: null
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

  routeFunction(route, nav) {
    var self = this;
    // if (self.state.nav != nav) self.setState({nav: nav});
    // if (self.state.route != route) self.setState({route: route})
    // console.log('navigate to ', route)
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

  render() {
    var self = this;
    return (
      <View style={{flex: 1}}>
        <Nav {...self.props} route={self.state.route} navigator={self.state.nav} />
        <Navigator
          renderScene={(route, navigator) =>
            self.routeFunction(route, navigator)
          }
          style={{flex: 1}}
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
    actions: bindActionCreators({...authActions, ...postActions, ...onlineActions, ...notifActions, ...animationActions, ...viewActions, ...messageActions, ...tagActions, ...userActions}, dispatch)
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Application)

