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
  Dimensions
} from 'react-native';

import {
  // setCustomView,
  // setCustomTextInput,
  setCustomText,
  // setCustomImage,
  // setCustomTouchableOpacity
} from 'react-native-global-props';
import StatusBarSizeIOS from 'react-native-status-bar-size';
import codePush from 'react-native-code-push';
import Orientation from 'react-native-orientation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Analytics from 'react-native-firebase-analytics';
import * as NavigationExperimental from 'react-navigation';
import RNBottomSheet from 'react-native-bottom-sheet';
import Prompt from 'react-native-prompt';
import PushNotification from 'react-native-push-notification';

import Auth from '../components/auth/auth.container';
import CreatePostContainer from '../components/createPost/createPost.container';
import Footer from '../components/nav/footer.container';
import ErrorContainer from './error.container';
import InvestAnimation from '../components/animations/investAnimation.component';
import HeartAnimation from '../components/animations/heartAnimation.component';
import UpvoteAnimation from '../components/animations/upvoteAnimation.component';

import StallScreen from '../components/stallScreen.component';
import ArticleView from '../components/post/articleView.container';
import * as authActions from '../actions/auth.actions';
import * as adminActions from '../actions/admin.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as tagActions from '../actions/tag.actions';
import * as messageActions from '../actions/message.actions';
import * as investActions from '../actions/invest.actions';
import * as navigationActions from '../actions/navigation.actions';
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';
import Card from './../components/nav/card.component';
import IrrelevantAnimation from '../components/animations/irrelevantAnimation.component';
import Tooltip from '../components/tooltip/tooltip.component';
import { fullWidth, fullHeight } from '../styles/global';

// Setting default styles for all Text components.
const customTextProps = {
  style: {
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#242425'
  }
};
setCustomText(customTextProps);

const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;


let ImagePicker = require('react-native-image-picker');

class Application extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      newName: null,
      height: fullHeight,
      statusBarHeight: StatusBarSizeIOS.currentHeight,
      statusBarInitial: StatusBarSizeIOS.currentHeight,
    };
    this.logoutRedirect = this.logoutRedirect.bind(this);
    this.backgroundTime = 0;
    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.configureTransition = this.configureTransition.bind(this);
    this.back = this.back.bind(this);
    this.handleOpenURL = this.handleOpenURL.bind(this);
  }

  componentDidMount() {
    this.props.actions.getUser();
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    utils.token.get()
    .catch(() => {
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'auth',
        header: false
      }, 0, 'home');
    });
    PushNotification.setApplicationIconBadgeNumber(0);

    Linking.addEventListener('url', this.handleOpenURL);
    this.statusBarHeight = StatusBar.currentHeight;

    this.fullHeight = fullHeight;

    Orientation.lockToPortrait();
    Orientation.addOrientationListener(() => {
      // fullWidth = Dimensions.get('window').width;
      this.setState({ height: Dimensions.get('window').height });
    });

    StatusBarSizeIOS.addEventListener('willChange', h => {
      // console.log('status bar ', h);
      //TODO user Dimensions.get('screen');
      // console.log(Dimensions.get('window'));
      this.setState({ statusBarHeight: h });
    });
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      // codePush.allowRestart();
      this.props.actions.userToSocket(next.auth.user._id);
      this.props.actions.getNotificationCount();
      this.props.actions.getFeedCount();

      if (next.auth.user.onboarding === 0) {
        this.props.actions.changeTab('discover');
      } else {
        // Original defaults to read
        this.props.actions.changeTab('discover');
      }
      this.props.actions.resetRoutes();

      this.props.actions.replaceRoute({
        key: 'tabs',
        component: 'tabs',
        header: false
      }, 0, 'home');
    }

    if (!this.props.error && next.error && next.auth.token) {
      this.props.actions.replaceRoute({
        key: 'error',
        component: 'error',
      }, 0, 'home');
      this.props.actions.resetRoutes('home');
    }

    if (this.props.auth.token && !next.auth.token) {
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'auth',
        header: false
      }, 0, 'home');
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  handleOpenURL(event) {
    let params = event.url.split('?')[1];
    let part1 = event.url.split('/')[3];
    let part2 = event.url.split('/')[4];
    let part3 = event.url.split('/')[5];
    let paramsLookup = {};
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
    if (part1 === 'resetPassword' && part2) {
      // Handle reset password link
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'auth',
        header: false
      }, 0, 'home');
      this.props.actions.resetRoutes('auth');
      this.props.actions.push({
        key: 'resetPassword',
        component: 'resetPassword',
        title: 'Reset Password',
        back: true,
        token: part2
      }, 'auth');
    } else if (part1 === 'confirm' && part2 && part3) {
      // Handle confirm email link
      this.props.actions.confirmEmail(part2, part3);
    } else if (part1 === 'invite' && part2) {
      // Handle invite link
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'auth',
        header: false
      }, 0, 'home');
      this.props.actions.resetRoutes('auth');

      this.props.actions.checkInviteCode(part2)
      .then(invite => {
        if (!invite) return;
        this.props.actions.push({
          key: 'signup',
          component: 'signup',
          title: 'Signup',
          back: true,
          code: part2,
          email: invite.email
        }, 'auth');
      });
    }
  }

  changeName() {
    let user = this.props.auth.user;

    // ANDROID
    if (Platform.OS === 'android') {
      this.promptTitle = 'Enter new name';
      this.setState({ promptVisible: true });
      return;
    }

    // IOS
    AlertIOS.prompt(
      'Enter new name',
      user.name,
      [
        { text: 'Cancel',
          style: 'cancel'
        },
        { text: 'OK',
          onPress: (newName) => {
            user.name = newName;
            this.props.actions.updateUser(user);
            this.setState({ newName });
          }
        },
      ],
    );
  }

  initImage() {
    this.chooseImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, this.props.auth.token).then((results) => {
          if (results.success) {
            let newUser = this.props.auth.user;
            newUser.image = results.url;
            this.props.actions.updateUser(newUser);
            setTimeout(() => this.props.actions.getSelectedUser(newUser._id), 250);
          } else {
            Alert.alert('Error uploading image');
            console.log('image error ', results);
          }
        });
      }
    });
  }

  chooseImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, (response) => {
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
    ActionSheet.showActionSheetWithOptions({
      options: [
        'Change display name',
        'Add new photo',
        'Invite Friends',
        'Blocked Users',
        'FAQ',
        'Logout',
        'Cancel',
      ],
      cancelButtonIndex: 6,
      destructiveButtonIndex: 5,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.changeName();
          break;
        case 1:
          this.initImage();
          break;
        case 2:
          if (!this.props.auth.user.confirmed) {
            Alert.alert('Please confirm your email first');
          } else {
            this.props.actions.viewInvites();
          }
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
          return;
      }
    });
  }

  logoutRedirect() {
    this.props.actions.removeDeviceToken(this.props.auth);
    this.props.actions.resetRoutes('auth');
    this.props.actions.resetRoutes('activity');
    this.props.actions.resetRoutes('discover');
    this.props.actions.resetRoutes('myProfile');
    this.props.actions.resetRoutes('read');
    this.props.actions.resetRoutes('createPost');

    this.props.actions.replaceRoute({
      key: 'auth',
      component: 'auth'
    }, 0, 'home');
    // this.props.actions.changeTab('read');
    this.props.actions.logoutAction(this.props.auth.user, this.props.auth.token);
  }

  // home button etc
  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active' && this.props.auth.user) {
      this.props.actions.userToSocket(this.props.auth.user._id);
      this.props.actions.getNotificationCount();
      this.props.actions.getFeedCount();

      this.props.actions.tooltipReady(true);

      PushNotification.setApplicationIconBadgeNumber(0);

      // refresh after 5 minutes of inactivity
      let now = new Date().getTime();
      // if (this.backgroundTime + (1000) < now) {
      if (this.backgroundTime + (10 * 60 * 1000) < now) {
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
    let component = props.scene.route.component;
    let createPost;

    // if (Platform.OS === 'ios') {
      createPost = (
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{
            flex: 1,
          }}
          keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0 }
        >
          <CreatePostContainer step={'url'} navProps={props} navigator={this.props.actions} />
        </KeyboardAvoidingView>
      );
    // } else {
    //   createPost = (
    //     <View
    //       behavior={'padding'}
    //       style={{
    //         flex: 1,
    //         // backgroundColor: 'red'
    //       }}
    //     >
    //       <CreatePostContainer step={'url'} navProps={props} navigator={this.props.actions} />
    //     </View>
    //   );
    // }

    switch (component) {
      case 'auth':
        return <Auth authType={component} navProps={props} navigator={this.props.actions} />;
      case 'createPost':
        return createPost;
      case 'categories':
        return (<CreatePostContainer step={'url'} navProps={props} navigator={this.props.actions} />);

      case 'articleView':
        return (<ArticleView scene={props.scene.route} navigator={this.props.actions} />);

      case 'tabs':
        return <Footer showActionSheet={this.showActionSheet} />;

      case 'error':
        return <ErrorContainer showActionSheet={this.showActionSheet} />;

      case 'stallScreen':
        return <StallScreen />;

      default:
        return null;
    }
  }

  configureTransition() {
    return {
      useNativeDriver: !!NativeAnimatedModule ? true : false,
      speed: 20,
    };
  }

  back() {
    this.props.actions.pop('home');
  }

  render() {
    let scene = this.props.navigation;

    // handle hidden bar in android here
    let route = scene.routes[scene.index];
    let statusBarHeight = StatusBar.currentHeight;
    if (route.component === 'articleView') {
      statusBarHeight = 0;
    }
    let defaultIOSBar = this.state.statusBarHeight ? this.state.statusBarInitial : 0;
    let height = Platform.OS === 'android' ?
      this.state.height - statusBarHeight :
      // TODO seems like height is defaults to 20? adjust for iphonex?
      this.state.height + defaultIOSBar - this.state.statusBarHeight;

    // main app view has to be absolute to make android keyboard work
    // could be relative for ios?
    return (
      <View
        style={{ height, backgroundColor: 'black' }}
      >
        <NavigationTransitioner
          style={{ backgroundColor: 'black' }}
          navigation={{ state: scene }}
          configureTransition={this.configureTransition}
          render={transitionProps => transitionProps.scene.route.ownCard ?
            this.renderScene(transitionProps) :
            (<Card
              style={{ backgroundColor: 'black' }}
              renderScene={this.renderScene}
              back={this.back}
              {...this.props}
              header={false}
              scroll={this.props.navigation.sroll}
              {...transitionProps}
            />)
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
    error: state.error.universal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...messageActions,
      ...userActions,
      ...investActions,
      ...navigationActions,
      ...tagActions,
      ...adminActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);
