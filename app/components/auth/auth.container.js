import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import {
//   // Easing
// } from 'react-native';
import codePush from 'react-native-code-push';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Transitioner from '../nav/Transitioner';
import Auth from './auth.component';
import Login from './login.component';
import SignUp from './signup.component';
import TwitterSignup from './twitterSignup.component';

import ImageUpload from './imageUpload.component';
import Forgot from './forgot.component';
import ResetPassword from './resetPassword.component';
import * as adminActions from '../../actions/admin.actions';
import * as authActions from '../../actions/auth.actions';
import * as navigationActions from '../../actions/navigation.actions';
import Card from '../nav/card.component';
import { globalStyles, localStyles } from '../../styles/global';
import { transitionConfig } from '../../utils';

let styles;

class AuthContainer extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    share: PropTypes.bool,
    scene: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.renderScene = this.renderScene.bind(this);
    this.back = this.back.bind(this);
  }

  componentWillUnmount() {
    codePush.allowRestart();
  }

  renderScene(props) {
    const component = props.scene.route.component;

    switch (component) {
      case 'auth':
        return <Auth {...this.props} />;

      case 'login':
        return <Login {...this.props} />;

      case 'twitterSignup':
        return <TwitterSignup {...this.props} />;

      case 'signup':
        return <SignUp {...this.props} scene={props.scene.route} />;

      case 'imageUpload':
        return <ImageUpload {...this.props} />;

      case 'forgot':
        return <Forgot {...this.props} />;

      case 'resetPassword':
        return <ResetPassword {...this.props} scene={props.scene} />;

      default:
        return <Auth {...this.props} />;
    }
  }

  back() {
    let scene = 'home';
    if (this.props.navigation.index > 0) scene = 'auth';
    this.props.actions.pop(scene);
  }

  render() {
    const scene = this.props.navigation;

    return (
      <Transitioner
        style={{ backgroundColor: 'black' }}
        navigation={{ state: scene }}
        configureTransition={transitionConfig}
        render={transitionProps => (
          <Card
            renderScene={this.renderScene}
            back={this.back}
            {...this.props}
            scroll={this.props.navigation.scroll}
            header
            share={this.props.share}
            {...transitionProps}
          />
        )}
      />
    );
  }
}

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    navigation: state.navigation.auth,
    admin: state.admin
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions,
        ...adminActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthContainer);
