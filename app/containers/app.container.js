'use strict';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  StatusBarIOS
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../actions/auth.actions';
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


class Application extends Component {
  componentDidMount() {
    // StatusBarIOS.setNetworkActivityIndicatorVisible(true);
  }

  render() {
    return (
      <View style={{flex:1}} >
      <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'white'}}/>
        <Router>
          <Route name="Auth" component={Auth} hideNavBar={false} hideFooter={false} type="replace" initial={true} title="Home" />
          <Route name="SignUp" component={Auth} hideNavBar={false} hideFooter={false} type="replace" title="Sign up" />
          <Route name="LogIn" component={Auth} type="replace" hideNavBar={false} hideFooter={false}  title="Log in" />
          <Route name="Import" component={Import} type="replace" hideNavBar={false} title="Import" />
          <Route name="Profile" component={Profile} type="replace" hideNavBar={false} title="Profile" />
          <Route name="Read" component={Read} type="replace" hideNavBar={false} title="Read" />
          <Route name="CreatePost" component={CreatePost} type="replace" hideNavBar={false} title="CreatePost" />
          <Route name="Discover" component={Discover} type="replace" hideNavBar={false} title="Discover" />
          <Route name="SinglePost" component={SinglePost} type="replace" hideNavBar={false} title="Single Post" />
          <Route name="User" component={User} type="replace" hideNavBar={false} title="User" />
          <Route name="ProfileOptions" component={ProfileOptions} type="replace" hideNavBar={false} title="Options" />
          <Route name="Activity" component={Activity} type="replace" hideNavBar={false} title="Activity" />



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

