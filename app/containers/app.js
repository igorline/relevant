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
import * as authActions from '../actions/authActions';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
var {NavBar, NavBarModal} = require('../components/NavBar');
var Button = require('react-native-button');
import Auth from './auth';
import Import from './import';
import Profile from './profile';
import Read from './read';
import Footer from './footer';
import Post from './post';
import Discover from './discover';
import Nav from './nav';


class Application extends Component {
  componentDidMount() {
    // StatusBarIOS.setNetworkActivityIndicatorVisible(true);

  }

  render() {
    return (
      <View style={{flex:1}} >
      <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'white'}}/>
        <Router>
          <Route name="Auth" component={Auth}  hideNavBar={false} hideFooter={false} type="replace" initial={true} title="Home" />
          <Route name="SignUp" component={Auth} hideNavBar={false} hideFooter={false} type="replace" title="Sign up" />
          <Route name="LogIn" component={Auth} hideNavBar={false} hideFooter={false} type="replace" title="Log in" />
          <Route name="Import" component={Import} hideNavBar={false}  type="replace" title="Import" />
          <Route name="Profile" component={Profile} hideNavBar={false}  type="replace" title="Profile" />
          <Route name="Read" component={Read} hideNavBar={false}  type="replace" title="Read" />
          <Route name="Post" component={Post} hideNavBar={false}  type="replace" title="Post" />
          <Route name="Discover" component={Discover} hideNavBar={false}  type="replace" title="Discover" />

          {/*<Schema name="modal" sceneConfig={Animations.FlatFloatFromBottom} footer={Nav}/>*/}
          <Schema name="default" sceneConfig={Animations.FlatFloatFromBottom} footer={Footer} navBar={Nav}/>
          {/*<Schema name="withoutAnimation" footer={Nav}/>*/}
          {/*<Schema name="tab" footer={Nav}/>*/}
        </Router>
      </View>
    );
  }
}

export default Application

const styles = StyleSheet.create({
  uploadAvatar: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C8AE8'
  },
  navItem: {
    color: 'white'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 200,
    alignSelf: 'center',
    margin: 5
  },
  marginTop: {
    marginTop: 10
  }
});

