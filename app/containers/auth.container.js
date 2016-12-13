import React, { Component } from 'react';
import {
  View,
  Text,
  NavigationExperimental,
  Image,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from '../components/auth.component';
import Login from '../components/login.component';
import SignUp from '../components/signup.component';
import * as authActions from '../actions/auth.actions';
import * as navigationActions from '../actions/navigation.actions';

import { globalStyles, localStyles, fullWidth } from '../styles/global';

const {
  Header: NavigationHeader,
} = NavigationExperimental;

let styles;

class AuthContainer extends Component {

  constructor(props, context) {
    super(props, context);
    this.renderScene = this.renderScene.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.back = this.back.bind(this);
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

  renderTitle(props) {
    let title = props.scene.route.title;
    return (
      <NavigationHeader.Title style={{ bottom: -4, backgroundColor: 'transparent' }}>
        <Image
          source={require('../assets/images/logo.png')}
          resizeMode={'contain'}
          style={{ width: 200, height: 25 }}
        />
      </NavigationHeader.Title>
    );
  }

  back() {
    this.props.actions.pop(this.props.navigation.main);
  }

  renderRight() {
    return null;
  }

  renderHeader(props) {
    console.log(props, 'header props');
    let header = null;
    if (props.scene.route) {
      if (props.scene.route.component === 'login' || props.scene.route.component === 'signup') {
        header = (
          <NavigationHeader
            {...props}
            style={[
              this.props.share ? styles.shareHeader : null,
              {
                backgroundColor: 'white',
                borderBottomColor: '#f0f0f0',
                borderBottomWidth: 1,
              }]}
            renderTitleComponent={this.renderTitle}
            onNavigateBack={this.back}
            renderRightComponent={this.renderRight}
          />
        );
      }
    }
    return header;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderHeader(this.props.navProps)}
        {this.renderScene(this.props.authType)}
      </View>
    );
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
