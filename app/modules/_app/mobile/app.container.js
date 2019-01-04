import React, { Component } from 'react';
import {
  View,
  AppState,
  ActionSheetIOS,
  AlertIOS,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  YellowBox
} from 'react-native';
import { setCustomText } from 'react-native-global-props';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RNBottomSheet from 'react-native-bottom-sheet';
import Prompt from 'rn-prompt';
import PushNotification from 'react-native-push-notification';
import SafariView from 'react-native-safari-view';

// Navigation
import Transitioner from 'modules/navigation/mobile/Transitioner';
import Card from 'modules/navigation/mobile/card.component';

import Auth from 'modules/auth/mobile/auth.container';
import CreatePostContainer from 'modules/createPost/mobile/createPost.container';
import Footer from 'modules/navigation/mobile/footer.container';
import ErrorComponent from 'modules/ui/mobile/error.component';

// Animiations
import InvestAnimation from 'modules/animation/mobile/investAnimation.component';
import HeartAnimation from 'modules/animation/mobile/heartAnimation.component';
import UpvoteAnimation from 'modules/animation/mobile/upvoteAnimation.component';
import IrrelevantAnimation from 'modules/animation/mobile/irrelevantAnimation.component';

import StallScreen from 'modules/navigation/mobile/stallScreen.component';
import ArticleView from 'modules/navigation/mobile/articleView.container';
import * as authActions from 'modules/auth/auth.actions';
import * as adminActions from 'modules/admin/admin.actions';
import * as postActions from 'modules/post/post.actions';
import * as userActions from 'modules/user/user.actions';
import * as notifActions from 'modules/activity/activity.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as investActions from 'modules/post/invest.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as utils from 'app/utils';
import { pickerOptions } from 'app/utils/pickerOptions';
import Tooltip from 'modules/tooltip/mobile/tooltip.component';
import { fullHeight } from 'app/styles/global';

// Setting default styles for all Text components.
const customTextProps = {
  style: {
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#242425'
  }
};
setCustomText(customTextProps);

YellowBox.ignoreWarnings(['Setting a timer']);

// eslint-disable-next-line
const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

const ImagePicker = require('react-native-image-picker');

class Application extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object,
    error: PropTypes.bool,
    navigation: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      newName: null,
      height: fullHeight,
    };
    this.logoutRedirect = this.logoutRedirect.bind(this);
    this.backgroundTime = 0;
    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.configureTransition = this.configureTransition.bind(this);
    this.back = this.back.bind(this);
    this.handleOpenURL = this.handleOpenURL.bind(this);
  }

  componentWillMount() {
    // hard-code community for now
    const community = 'relevant';
    this.props.actions.setCommunity(community);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    this.props.actions.getUser()
    .then(async user => {
      if (!user) {
        return this.props.actions.replaceRoute(
          {
            key: 'auth',
            component: 'auth',
            header: false
          },
          0,
          'home'
        );
      }

      return this.props.actions.replaceRoute(
        {
          key: 'tabs',
          component: 'tabs',
          header: false
        },
        0,
        'home'
      );
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

      if (next.auth.user.onboarding === 0) {
        this.props.actions.changeTab('discover');
      } else {
        // Original defaults to read
        this.props.actions.changeTab('discover');
      }
      this.props.actions.resetRoutes();

      this.props.actions.replaceRoute(
        {
          key: 'tabs',
          component: 'tabs',
          header: false
        },
        0,
        'home'
      );
    }

    if (!this.props.error && next.error && next.auth.token) {
      this.props.actions.replaceRoute(
        {
          key: 'error',
          component: 'error'
        },
        0,
        'home'
      );
      this.props.actions.resetRoutes('home');
    }

    if (this.props.auth.token && !next.auth.token) {
      this.props.actions.replaceRoute(
        {
          key: 'auth',
          component: 'auth',
          header: false
        },
        0,
        'home'
      );
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  handleOpenURL(event) {
    let params = event.url.split('?')[1];
    const part1 = event.url.split('/')[3];
    const part2 = event.url.split('/')[4];
    const part3 = event.url.split('/')[5];
    const part4 = event.url.split('/')[6];

    const paramsLookup = {};
    if (params) {
      params = params.split('&');
      params.forEach(p => {
        p = p.split('=');
        paramsLookup[p[0]] = p[1];
      });
    }
    if (part1 === 'faq') {
      this.props.actions.goToUrl('https://relevant.community/faq');
    }
    if (part1 === 'user' && part2 === 'resetPassword' && part3) {
      // Handle reset password link
      this.props.actions.replaceRoute(
        {
          key: 'auth',
          component: 'auth',
          header: false
        },
        0,
        'home'
      );
      this.props.actions.resetRoutes('auth');
      this.props.actions.push(
        {
          key: 'resetPassword',
          component: 'resetPassword',
          title: 'Reset Password',
          back: true,
          token: part3
        },
        'auth'
      );
    } else if (part1 === 'user' && part2 === 'confirm' && part3 && part4) {
      // Handle confirm email link
      this.props.actions.confirmEmail(part3, part4);
    } else if (part1 === 'user' && part2 === 'invite' && part3) {
      // Handle invite link
      this.props.actions.replaceRoute(
        {
          key: 'auth',
          component: 'auth',
          header: false
        },
        0,
        'home'
      );
      this.props.actions.resetRoutes('auth');

      this.props.actions.checkInviteCode(part3).then(invite => {
        if (!invite) return;
        this.props.actions.push(
          {
            key: 'signup',
            component: 'signup',
            title: 'Signup',
            back: true,
            code: part3,
            email: invite.email
          },
          'auth'
        );
      });
    }
  }

  changeName() {
    const { user } = this.props.auth;

    // ANDROID
    if (Platform.OS === 'android') {
      this.promptTitle = 'Enter new name';
      this.setState({ promptVisible: true });
      return;
    }

    // IOS
    AlertIOS.prompt('Enter new name', user.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: newName => {
          user.name = newName;
          this.props.actions.updateUser(user);
          this.setState({ newName });
        }
      }
    ]);
  }

  initImage() {
    this.chooseImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, this.props.auth.token).then(results => {
          if (results.success) {
            const newUser = this.props.auth.user;
            newUser.image = results.url;
            this.props.actions.updateUser(newUser);
            setTimeout(() => this.props.actions.getSelectedUser(newUser._id), 250);
          } else {
            Alert.alert('Error uploading image');
          }
        });
      }
    });
  }

  chooseImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, response => {
      if (response.didCancel) {
        callback('cancelled');
      } else if (response.error) {
        callback('error');
      } else if (response.customButton) {
        callback('error');
      } else {
        callback(null, response.uri);
      }
    });
  }

  showActionSheet() {
    ActionSheet.showActionSheetWithOptions(
      {
        options: [
          'Change display name',
          'Add new photo',
          'Invite Friends',
          'Blocked Users',
          'FAQ',
          'Logout',
          'Cancel'
        ],
        cancelButtonIndex: 6,
        destructiveButtonIndex: 5
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            this.changeName();
            break;
          case 1:
            this.initImage();
            break;
          case 2:
            this.props.actions.getUser().then(user => {
              if (!user.confirmed) {
                Alert.alert('Please confirm your email first', '', [
                  { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                  {
                    text: 'Resend Email',
                    onPress: () => this.props.actions.sendConfirmation()
                  }
                ]);
              } else {
                this.props.actions.viewInvites();
              }
            });
            break;
          case 3:
            this.props.actions.viewBlocked();
            break;
          case 4:
            this.props.actions.goToUrl('https://relevant.community/faq');
            break;
          case 5:
            this.logoutRedirect();
            break;
          default:
        }
      }
    );
  }

  logoutRedirect() {
    this.props.actions.removeDeviceToken(this.props.auth);
    this.props.actions.resetRoutes('auth');
    this.props.actions.resetRoutes('activity');
    this.props.actions.resetRoutes('discover');
    this.props.actions.resetRoutes('myProfile');
    this.props.actions.resetRoutes('read');
    this.props.actions.resetRoutes('createPost');

    this.props.actions.replaceRoute(
      {
        key: 'auth',
        component: 'auth'
      },
      0,
      'home'
    );
    // this.props.actions.changeTab('read');
    this.props.actions.logoutAction(this.props.auth.user, this.props.auth.token);
  }

  // home button etc
  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active' && this.props.auth.user) {
      this.props.actions.userToSocket(this.props.auth.user._id);
      this.props.actions.getNotificationCount();
      // this.props.actions.getFeedCount();

      this.props.actions.tooltipReady(true);

      PushNotification.setApplicationIconBadgeNumber(0);

      // refresh after 5 minutes of inactivity
      const now = new Date().getTime();
      // if (this.backgroundTime + (1000) < now) {
      if (this.backgroundTime + 10 * 60 * 1000 < now) {
        // reload current tab
        // reload all other tabs on focus
        this.props.actions.reloadAllTabs();
        this.props.actions.reloadTab();
      }
      // if (this.backgroundTime + (40 * 60 * 1000) < now) {
      //   this.props.actions.resetRoutes();
      // }
    } else if (currentAppState === 'background') {
      this.backgroundTime = new Date().getTime();
    }
    return true;
  }

  renderScene(props) {
    const { component } = props.scene.route;

    const { error } = this.props;
    if (error) {
      return <ErrorComponent
        parent="universal"
        reloadFunction={this.props.actions.getUser}
      />;
    }

    const createPost = (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{
          flex: 1
        }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
      >
        <CreatePostContainer
          step={'url'}
          navProps={props}
          navigator={this.props.actions}
        />
      </KeyboardAvoidingView>
    );

    switch (component) {
      case 'auth':
        return (
          <Auth authType={component} navProps={props} navigator={this.props.actions} />
        );
      case 'createPost':
        return createPost;

      case 'categories':
        return (
          <CreatePostContainer
            step={'url'}
            navProps={props}
            navigator={this.props.actions}
          />
        );

      case 'articleView':
        return <ArticleView scene={props.scene.route} navigator={this.props.actions} />;

      case 'tabs':
        return <Footer showActionSheet={this.showActionSheet} />;

      case 'error':
        return <ErrorComponent parent="universal" reloadFunction={this.props.actions.getUser} />;

      case 'stallScreen':
        return <StallScreen />;

      default:
        return null;
    }
  }

  configureTransition() {
    return {
      useNativeDriver: !!NativeAnimatedModule || false,
      speed: 20,
      timing: Animated.spring,
      bounciness: 0,
      overshootClamping: true
    };
  }

  back() {
    this.props.actions.pop('home');
  }

  render() {
    const scene = this.props.navigation;

    // handle hidden bar in android here
    const route = scene.routes[scene.index];
    let statusBarHeight = StatusBar.currentHeight;
    if (route.component === 'articleView') {
      statusBarHeight = 0;
    }
    // android only
    const height = this.state.height - statusBarHeight;

    let platformStyles = {};
    if (Platform.OS === 'android') {
      platformStyles = { height };
    } else {
      platformStyles = { flex: 1 };
    }
    // main app view has to be absolute to make android keyboard work
    // could be relative for ios?
    return (
      <View style={{ ...platformStyles, backgroundColor: 'black' }}>
        <Transitioner
          key="Home"
          style={{ backgroundColor: 'black' }}
          navigation={{ state: scene }}
          configureTransition={this.configureTransition}
          render={transitionProps =>
            transitionProps.scene.route.ownCard ? (
              this.renderScene(transitionProps)
            ) : (
              <Card
                style={{ backgroundColor: 'black' }}
                renderScene={this.renderScene}
                back={this.back}
                {...this.props}
                header={false}
                scroll={this.props.navigation.sroll}
                {...transitionProps}
              />
            )
          }
        />
        <Tooltip />

        <Prompt
          title={this.promptTitle || ''}
          visible={this.state.promptVisible}
          onCancel={() => this.setState({ promptVisible: false })}
          onSubmit={newName => {
            this.props.auth.user.name = newName;
            this.props.actions.updateUser(this.props.auth.user);
            this.setState({
              promptVisible: false,
              newName
            });
          }}
        />

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
    navigation: state.navigation.home,
    error: state.error.universal
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...postActions,
        ...notifActions,
        ...userActions,
        ...investActions,
        ...navigationActions,
        ...tagActions,
        ...adminActions,
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
