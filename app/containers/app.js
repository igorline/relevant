'use strict';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../actions/authActions';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
var {NavBar, NavBarModal} = require('../components/NavBar');
import Auth from './auth';
import Import from './import';
import Profile from './profile';

class Application extends Component {
  render() {
    return (

    <View style={{flex:1}} >
                <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'white'}}/>
                <Router>
                    <Schema name="modal" sceneConfig={Animations.FlatFloatFromBottom} navBar={NavBarModal}/>
                    <Schema name="default" sceneConfig={Animations.FlatFloatFromRight} navBar={NavBar}/>
                    <Schema name="withoutAnimation" navBar={NavBar}/>
                    <Schema name="tab" navBar={NavBar}/>

                  <Route name="Auth" component={Auth}  hideNavBar={true} type="replace" initial={true} title="Home" />
                  <Route name="SignUp" component={Auth} hideNavBar={true} type="replace" title="Sign up" />
                  <Route name="LogIn" component={Auth} hideNavBar={true}  type="replace" title="Log in" />
                  <Route name="Import" component={Import} hideNavBar={true}  type="replace" title="Import" />
                  <Route name="Profile" component={Profile} hideNavBar={true}  type="replace" title="Profile" />
                </Router>

            </View>

    );
  }
}

export default Application

