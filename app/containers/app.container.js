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
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
var Button = require('react-native-button');
import Auth from './auth.container';
import Import from './import.container';
import Profile from './profile.container';
import Read from './read.container';
import Footer from './footer.container';
import CreatePost from './createPost.container';
import Discover from './discover.container';
import Nav from './nav.container';
import SinglePost from './singlePost.container';
import User from './user.container';
import ProfileOptions from './profileOptions.container';
import Activity from './activity.container';
import Comments from './comments.container';
import Thirst from './thirst.container';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import * as onlineActions from '../actions/online.actions';

class Application extends Component {

  render() {
    return (
      <View style={{flex:1}} >
      <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'white'}}/>
        <Router>
          <Route name="Auth" component={Auth} hideNavBar={false} hideFooter={false} type="replace" initial={true} title="Home" />
          <Route name="SignUp" component={Auth} hideNavBar={false} hideFooter={false}  title="Sign up" />
          <Route name="LogIn" component={Auth} hideNavBar={false} hideFooter={false}  title="Log in" />
          <Route name="Import" component={Import} hideNavBar={false} title="Import" />
          <Route name="Profile" type="replace" component={Profile} hideNavBar={false} title="Profile" />
          <Route name="Read" type="replace" component={Read} hideNavBar={false} title="Read" />
          <Route name="CreatePost" type="replace" component={CreatePost} hideNavBar={false} title="CreatePost" />
          <Route name="Discover" type="replace" component={Discover} hideNavBar={false} title="Discover" />
          <Route name="SinglePost" type="replace" component={SinglePost} hideNavBar={false} title="Single Post" />
          <Route name="User" type="replace" component={User} hideNavBar={false} title="User" />
          <Route name="ProfileOptions" component={ProfileOptions} hideNavBar={false} title="Options" />
          <Route name="Activity" type="replace" component={Activity} hideNavBar={false} title="Activity" />
          <Route name="Comments" component={Comments} hideNavBar={false} title="Comments" />
          <Route name="Thirst" component={Thirst} hideNavBar={false} title="Thirsty?" />

          {/*<Schema name="modal" sceneConfig={Animations.FlatFloatFromBottom} footer={Nav} navBar={Nav}/>*/}
          {/*<Schema name="default" sceneConfig={Animations.FlatFloatFromRight} footer={Footer} navBar={Nav}/>*/}
          <Schema name="default" footer={Footer} navBar={Nav}/>
          {/*<Schema name="withoutAnimation" footer={Nav}/>*/}
          {/*<Schema name="tab" footer={Nav}/>*/}
        </Router>
      </View>
    );
  }
}

export default Application

// function mapStateToProps(state) {
//   return {
//     auth: state.auth,
//     posts: state.posts,
//     users: state.user,
//     router: state.routerReducer,
//     notif: state.notif,
//     socket: state.socket
//    }
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators({...authActions, ...postActions, ...notifActions, ...onlineActions }, dispatch)
//   }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(Application)

