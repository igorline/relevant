import React, { Component } from 'react';
import { View, AppState, Linking, Platform, StatusBar, YellowBox } from 'react-native';

import { setCustomText } from 'react-native-global-props';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PushNotification from 'react-native-push-notification';
import SafariView from 'react-native-safari-view';
import { AppContainer, RootStack } from 'modules/_app/mobile/mainRouter';

// Animiations
import InvestAnimation from 'modules/animation/mobile/investAnimation.component';
import HeartAnimation from 'modules/animation/mobile/heartAnimation.component';
import UpvoteAnimation from 'modules/animation/mobile/upvoteAnimation.component';
import IrrelevantAnimation from 'modules/animation/mobile/irrelevantAnimation.component';

import * as authActions from 'modules/auth/auth.actions';
import * as userActions from 'modules/user/user.actions';
import * as notifActions from 'modules/activity/activity.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import Tooltip from 'modules/tooltip/mobile/tooltip.container';
import { fullHeight } from 'app/styles/global';
import queryString from 'query-string';

// import {
//   StackActions,
//   NavigationActions,
// } from 'react-navigation';

// Setting default styles for all Text components.
const customTextProps = {
  style: {
    // fontSize: 14,
    fontFamily: 'HelveticaNeue'
    // color: '#242425'
  }
};
setCustomText(customTextProps);

YellowBox.ignoreWarnings(['Setting a timer']);

// eslint-disable-next-line
const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

class Application extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    // error: PropTypes.bool,
    navigation: PropTypes.object
  };

  static router = RootStack.router;

  constructor(props, context) {
    super(props, context);
    this.state = {
      newName: null,
      height: fullHeight
    };
    this.backgroundTime = 0;
  }

  componentWillMount() {
    // hard-code community for now
    const community = 'relevant';
    this.props.actions.setCommunity(community);
  }

  componentDidMount() {
    const { navigation } = this.props;
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));

    // TODO - error state & loading state
    //   const { error } = this.props;
    //   if (error) {
    //     return <ErrorComponent
    //       parent="universal"
    //       reloadFunction={this.props.actions.getUser}
    //     />;
    //   }
    this.props.actions.getUser().then(async user => {
      if (!user) {
        // TODO - should reset data if logged out
        navigation.navigate('auth');
        // navigation.replace('auth');

        // const resetAction = StackActions.reset({
        //   index: 0,
        //   key: null,
        //   actions: [
        //     NavigationActions.navigate({
        //       routeName: 'container',
        //       action: NavigationActions.navigate({ routeName: 'auth' })
        //     })
        //   ],
        // });
        // return this.props.navigation.dispatch(resetAction);
      }
    });

    PushNotification.setApplicationIconBadgeNumber(0);
    Linking.addEventListener('url', this.handleOpenURL);
    this.fullHeight = fullHeight;
    Orientation.lockToPortrait();

    if (SafariView.addEventListener) {
      SafariView.addEventListener('onDismiss', () => {
        Orientation.lockToPortrait();
      });
    }
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      this.props.actions.userToSocket(next.auth.user._id);
      this.props.actions.getNotificationCount();
    }
  }

  handleOpenURL = url => {
    const { actions, navigation, auth } = this.props;
    const query = url.url.split('?')[1];

    const parsed = queryString.parse(query);

    if (parsed.invitecode && !auth.isAuthenticated) {
      actions.setInviteCode(parsed.invitecode);
      navigation.navigate('twitterSignup');
    }
  };

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  // home button etc
  handleAppStateChange(currentAppState) {
    const { navigation } = this.props;
    const { state } = navigation;
    if (currentAppState === 'active' && this.props.auth.user) {
      this.props.actions.userToSocket(this.props.auth.user._id);
      this.props.actions.getNotificationCount();

      this.props.actions.tooltipReady(true);

      PushNotification.setApplicationIconBadgeNumber(0);

      // refresh after 5 minutes of inactivity
      const now = new Date().getTime();
      if (this.backgroundTime + 10 * 60 * 1000 < now) {
        // reload current tab
        if (!state.routes) return null;
        const childKey = state.routes[state.index].key;
        const tabNav = this.props.navigation.getChildNavigation(childKey);
        if (!tabNav.state || !state.routes.routes) return null;
        const currentTab = tabNav.state.routes[tabNav.state.index];
        this.props.actions.reloadTab(currentTab.key);

        // reload all other tabs on focus
        return this.props.actions.reloadAllTabs();
      }
    }

    this.backgroundTime = new Date().getTime();
    return true;
  }

  render() {
    let platformStyles = {};
    if (Platform.OS === 'android') {
      const height = this.state.height - StatusBar.currentHeight;
      platformStyles = { height };
    } else {
      platformStyles = { flex: 1 };
    }
    // main app view has to be absolute to make android keyboard work
    return (
      <View style={{ ...platformStyles, backgroundColor: 'black' }}>
        <AppContainer navigation={this.props.navigation} />
        <Tooltip />
        <InvestAnimation />
        <HeartAnimation />
        <IrrelevantAnimation />
        <UpvoteAnimation />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    error: state.error.universal
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...notifActions,
        ...userActions,
        ...navigationActions,
        ...tooltipActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Application);
