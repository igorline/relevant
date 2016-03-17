'use strict';

import React, { Component, StyleSheet } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../actions/authActions';
import {
  actions as routerActions,
  NavBar,
  Route,
  Router,
  Schema,
  TabBar,
  TabRoute
} from 'react-native-router-redux';
import Auth from './auth';

class Application extends Component {
  render() {
    return (
      <Router {...this.props} initial="Auth">
        <Route name="Auth" component={Auth} type="reset" hideNavBar={true} />
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  router: state.router,
  auth: state.auth
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    ...routerActions,
    ...authActions
  }, dispatch),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Application);