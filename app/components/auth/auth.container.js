import React, { Component } from 'react';
import {
  Easing
} from 'react-native';
import * as NavigationExperimental from 'react-navigation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from './auth.component';
import Login from './login.component';
import SignUp from './signup.component';
import ImageUpload from './imageUpload.component';
import Forgot from './forgot.component';
import ResetPassword from './resetPassword.component';
import * as adminActions from '../../actions/admin.actions';
import * as authActions from '../../actions/auth.actions';
import * as navigationActions from '../../actions/navigation.actions';
import Card from '../nav/card.component';
import { globalStyles, localStyles } from '../../styles/global';

const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;

let styles;

class AuthContainer extends Component {

  constructor(props, context) {
    super(props, context);
    this.renderScene = this.renderScene.bind(this);
    this.back = this.back.bind(this);
  }

  renderScene(props) {
    let component = props.scene.route.component;

    switch (component) {
      case 'auth':
        return <Auth {...this.props} />;

      case 'login':
        return <Login {...this.props} />;

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

  configureTransition() {
    const easing = Easing.bezier(0.0, 0, 0.58, 1);
    return {
      duration: 220,
      easing,
      useNativeDriver: !!NativeAnimatedModule ? true : false
    };
  }

  render() {
    let scene = this.props.navigation;

    return (<NavigationTransitioner
      style={{ backgroundColor: 'white' }}
      navigation={{ state: scene }}
      configureTransition={this.configureTransition}
      render={transitionProps => (
        <Card
          renderScene={this.renderScene}
          back={this.back}
          {...this.props}
          scroll={this.props.navigation.scroll}
          header
          share={this.props.share}
          {...transitionProps}
        />)}
    />);
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
      dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(AuthContainer);
