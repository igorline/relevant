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
// import {
//   actions as routerActions,
//   NavBar,
//   Route,
//   Router,
//   Schema,
//   TabBar,
//   TabRoute
// } from 'react-native-router-redux';
import Auth from './auth';
import Import from './import';
import Profile from './profile';
// import Master from '../components/master';

// const defaultSchema = {
//   navBar: NavBar,
//   navLeftColor: '#FFFFFF',
//   navTint: '#224655',
//   navTitleColor: '#000000',
//   navTitleStyle: {
//     fontFamily: 'Avenir Next',
//     fontSize: 18,
//   },
//   statusStyle: 'light-content',
//   tabBar: TabBar,
// };

// const assets = {
//   'calendar': require('../../assets/thin-0021_calendar_month_day_planner.png'),
//   'home': require('../../assets/thin-0046_home_house.png'),
//   'logo': require('../../assets/qwikly.png'),
//   'profile': require('../../assets/thin-0091_file_profile_user_personal.png'),
//   'video': require('../../assets/thin-0592_tv_televison_movie_news.png'),
// };

class Application extends Component {
  render() {
    return (

    <View style={{flex:1}}>
                <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'#F5FCFF'}}/>
                <Router>
                    <Schema name="modal" sceneConfig={Animations.FlatFloatFromBottom} navBar={NavBarModal}/>
                    <Schema name="default" sceneConfig={Animations.FlatFloatFromRight} navBar={NavBar}/>
                    <Schema name="withoutAnimation" navBar={NavBar}/>
                    <Schema name="tab" navBar={NavBar}/>

                    {/*<Route name="launch" component={Launch} initial={true} hideNavBar={true} title="Launch"/>
                    <Route name="register" component={Register} title="Register"/>
                    <Route name="home" component={Home} title="Home" type="replace"/>
                    <Route name="login" component={Login} schema="modal"/>
                    <Route name="register2" component={Register} schema="withoutAnimation"/>
                    <Route name="error" component={Error} schema="popup"/>*/}

                  <Route name="Auth" component={Auth} type="reset" hideNavBar={true} initial={true} />
                  <Route name="SignUp" component={Auth}  />
                  <Route name="LogIn" component={Auth}   />
                  <Route name="Import" component={Import} />
                  <Route name="Profile" component={Profile} />
                </Router>

            </View>

    );
  }
}

// const mapStateToProps = state => ({
//   // router: state.router,
//   auth: state.auth,
//   form: state.formReducer
// });

// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators({
//     // ...routerActions,
//     ...authActions
//   }, dispatch),
//   dispatch,
// });

// export default connect(mapStateToProps, mapDispatchToProps)(Application);


// export default Application

// import * as actionCreators from './actionCreators'

// function mapStateToProps(state) {
//   console.log(state, 'state')
//   return { auth: state }
// }

// export default connect(mapStateToProps, authActions)(Application)