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
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import * as onlineActions from '../actions/online.actions';


class Application extends Component {
  // constructor (props, context) {
  //   super(props, context)
  //    // this.socket = io('localhost:3000', {jsonp: false});
  //   this.state = {
  //     currentAppState: AppState.currentState,
  //   }
  // }

  // // getInitialState() {
  // //   return {

  // //   };
  // // }

  // componentDidMount() {
  //   var self = this;
  //   console.log(this, 'app this')
  //   //this.props.actions.getUser();
  //   //AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  // }

  // componentWillReceiveProps(next) {
  //   var self = this;
  //   console.log(this)
  //   // console.log('hello', next);
  //   // console.log(self, 'update self')
  //   if (self.props.auth.user != next.auth.user) {
  //     //self.handleAppStateChange.bind(self);
  //     // dispatch({type:'server/storeUser', payload: next.auth.user})
  //     // console.log('send user to socket', next.auth.user);
  //     //  self.props.actions.userToSocket(next.auth.user)
  //     // console.log('ok')
  //   }
  // }

  // componentWillUnmount() {
  //   var self = this;
  //   //AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  // }

  // handleAppStateChange(currentAppState) {
  //   var self = this;

  //   //console.log('wtfff')
  //   //self.setState({ currentAppState: currentAppState});
  //   console.log('hello', currentAppState, self.props.auth.user)
  //   if (currentAppState == 'active' && self.props.auth.user) {
  //       console.log('send user to socket', self.props.auth.user.name);
  //       self.props.actions.userToSocket(self.props.auth.user)
  //      // dispatch({type:'server/storeUser', payload: self.props.auth.user})
  //   }
  // }


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

