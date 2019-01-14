import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import * as authActions from 'modules/auth/auth.actions';
import { goToUrl, push } from 'modules/navigation/navigation.actions';

import {
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { AuthNavigator, AuthStack } from 'modules/_app/mobile/authRouter';


class AuthContainer extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  static router = AuthStack.router;

  componentDidMount() {
    this.props.actions.getUser()
    .then(async user => {
      if (!user) return null;
      const resetAction = StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: 'container',
            action: NavigationActions.navigate({ routeName: 'main' })
          })
        ],
      });
      return this.props.navigation.dispatch(resetAction);
    });
  }

  componentDidUpdate() {
    if (this.props.auth.user) {
      const resetAction = StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: 'container',
            action: NavigationActions.navigate({ routeName: 'main' })
          })
        ],
      });
      this.props.navigation.dispatch(resetAction);
    }
  }

  componentWillUnmount() {
    codePush.allowRestart();
  }

  render() {
    return (
      <View style={{ flex: 1 }} uriPrefix={'Relevant://'}>
        <AuthNavigator navigation={this.props.navigation} screenProps={this.props}/>
      </View>
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
      push
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthContainer);
