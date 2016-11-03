import React, { Component } from 'react';
import {
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from '../components/auth.component';
import Login from '../components/login.component';
import SignUp from '../components/signup.component';
import * as authActions from '../actions/auth.actions';
import * as navigationActions from '../actions/navigation.actions';

import { globalStyles, localStyles } from '../styles/global';

let styles;

class AuthContainer extends Component {

  constructor(props, context) {
    super(props, context);
    this.renderScene = this.renderScene.bind(this);
  }

  renderScene(key) {
    switch (key) {
      case 'auth':
        return <Auth {...this.props} />;

      case 'login':
        return <Login {...this.props} />;

      case 'signup':
        return <SignUp {...this.props} />;

      default:
        return <Auth {...this.props} />;
    }
  }

  render() {
    return this.renderScene(this.props.authType);
  }
}

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    navigation: state.navigation,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions
      },
      dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(AuthContainer);
