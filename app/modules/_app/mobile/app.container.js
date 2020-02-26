import React, { Component } from 'react';
import { View, AppState, Linking, Platform, StatusBar, Dimensions } from 'react-native';

import { setCustomText } from 'react-native-global-props';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PushNotification from 'react-native-push-notification';
import SafariView from 'react-native-safari-view';
import { AppContainer, RootStack } from 'modules/_app/mobile/mainRouter';
import { analytics } from 'react-native-firebase';

// Animiations
import InvestAnimation from 'modules/animation/mobile/investAnimation.component';
import HeartAnimation from 'modules/animation/mobile/heartAnimation.component';
import UpvoteAnimation from 'modules/animation/upvoteAnimation.component';
import DownvoteAnimation from 'modules/animation/downvoteAnimation.component';

import * as authActions from 'modules/auth/auth.actions';
import * as userActions from 'modules/user/user.actions';
import * as notifActions from 'modules/activity/activity.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { getEarnings } from 'modules/wallet/earnings.actions';
import { getCommunities } from 'modules/community/community.actions';

import BannerPrompt from 'modules/bannerPrompt/banner.container';
import Tooltip from 'modules/tooltip/mobile/tooltip.container';
import { fullHeight } from 'app/styles/global';
import queryString from 'query-string';
import { BANNED_COMMUNITY_SLUGS } from 'server/config/globalConstants';
import PriceProvider from 'modules/wallet/price.context';

import { BottomSheet } from 'modules/ui/mobile/bottomSheet';
import * as modals from 'modules/ui/modals/mobile.lookup';

import Ionicons from 'react-native-vector-icons/Ionicons';

global.Buffer = global.Buffer || require('buffer').Buffer;

Ionicons.loadFont();

const Analytics = analytics();

// Setting default styles for all Text components.
const customTextProps = {
  style: {
    fontFamily: 'HelveticaNeue'
  }
};
setCustomText(customTextProps);

StatusBar.setBarStyle('dark-content');

class Application extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    globalModal: PropTypes.string,
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
    const { actions } = this.props;
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    const { width } = Dimensions.get('window');
    this.props.actions.setWidth(width);

    // TODO - error state & loading state
    //   const { error } = this.props;
    //   if (error) {
    //     return <ErrorComponent
    //       parent="universal"
    //       reloadFunction={this.props.actions.getUser}
    //     />;
    //   }
    actions.getUser().then(async user => {
      if (!user) {
        return this.props.actions.setScrollTab('discover', { tab: 1 });
        // return navigation.navigate('auth');
      }
      Analytics.setUserId(user._id);
      const { community } = user;
      if (community) actions.setCommunity(community);
      actions.getEarnings('pending');
      return null;
    });
    actions.getCommunities();

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

  componentDidUpdate(prev) {
    const { auth, actions } = this.props;
    if (!prev.auth.user && auth.user) {
      Analytics.setUserId(auth.user._id);

      actions.userToSocket(auth.user._id);
      actions.getNotificationCount();

      const { community } = auth.user;
      if (community) actions.setCommunity(community);

      if (auth.invitecode) {
        actions.redeemInvite(auth.invitecode);
      }
    }
  }

  handleOpenURL = url => {
    const { actions, navigation, auth } = this.props;

    // TWitter callback
    if (url.url.match('://callback')) {
      if (!auth.community) actions.setCommunity('relevant');
      return;
    }

    const params = url.url.split(/\/\//)[1].split(/\/|\?/);
    let newCommunity = params[1];

    newCommunity = newCommunity && newCommunity.replace(/user|admin|info/, '');

    // handle confirm email link
    if (url.url.match('/user/confirm')) {
      const user = params[2];
      const confirmCode = params[3];
      actions.confirmEmail(user, confirmCode);
    }

    if (
      !newCommunity ||
      newCommunity === 'user' ||
      newCommunity === 'info' ||
      newCommunity === 'admin'
    ) {
      newCommunity = 'relevant';
    }

    if (
      newCommunity &&
      newCommunity !== '' &&
      newCommunity !== auth.community &&
      !BANNED_COMMUNITY_SLUGS.includes(newCommunity)
    ) {
      actions.setCommunity(newCommunity);
    }

    const query = url.url.split('?')[1];
    const parsed = queryString.parse(query);

    if (parsed.invitecode && !auth.isAuthenticated) {
      actions.setInviteCode(parsed.invitecode);
      navigation.navigate('twitterSignup');
    }

    if (parsed.invitecode && auth.isAuthenticated) {
      actions.redeemInvite(parsed.invitecode);
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
        const tabNavigator = state.routes[0];
        if (!tabNavigator.routes) return null;
        const currentTab = tabNavigator.routes[tabNavigator.index].routeName;
        this.props.actions.reloadTab(currentTab);

        // reload all other tabs on focus
        return this.props.actions.reloadAllTabs();
      }
    }

    this.backgroundTime = new Date().getTime();
    return true;
  }

  renderModal() {
    const { globalModal } = this.props;

    if (!globalModal) return null;
    const modalProps = modals[globalModal] || globalModal;

    if (typeof modalProps === 'string') return null;
    const { Body } = modalProps;

    const bodyProps = modalProps.bodyProps ? modalProps.bodyProps : {};
    const close = () => {
      this.props.actions.hideModal();
    };
    return (
      <BottomSheet {...modalProps} close={close} visible>
        <Body {...bodyProps} close={close} />
      </BottomSheet>
    );
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
        <PriceProvider>
          <AppContainer navigation={this.props.navigation} />
          <BannerPrompt isMobile />
          {this.renderModal()}
          <Tooltip />
          <InvestAnimation />
          <HeartAnimation />
          <DownvoteAnimation />
          <UpvoteAnimation />
        </PriceProvider>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    error: state.error.universal,
    globalModal: state.navigation.modal,
    discoverTab: state.navigation.discover.tab
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
        ...tooltipActions,
        getEarnings,
        getCommunities
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Application);
