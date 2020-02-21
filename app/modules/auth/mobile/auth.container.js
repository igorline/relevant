import React, { Component } from 'react';
import { SafeAreaView } from 'react-navigation';

import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import * as authActions from 'modules/auth/auth.actions';
import {
  goToUrl,
  push,
  reloadTab,
  refreshTab
} from 'modules/navigation/navigation.actions';

import { AuthNavigator, AuthStack } from 'modules/_app/mobile/authRouter';

class AuthContainer extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  static router = AuthStack.router;

  componentDidMount() {
    this.props.actions.getUser().then(async user => {
      if (!user) return null;
      codePush.allowRestart();
      return this.props.navigation.navigate('main');
    });
  }

  componentDidUpdate() {
    if (this.props.auth.user) {
      codePush.allowRestart();
      this.props.navigation.navigate('main');
    }
  }

  componentWillUnmount() {
    codePush.allowRestart();
    this.props.actions.refreshTab('discover');
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }} forceInset={{ top: 'never' }}>
        <AuthNavigator navigation={this.props.navigation} screenProps={this.props} />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  admin: state.admin
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...adminActions,
      goToUrl,
      push,
      refreshTab,
      reloadTab
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthContainer);
