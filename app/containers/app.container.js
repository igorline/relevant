import React, { Component } from 'react';
import {
  NavigationExperimental,
  View,
  AppState,
  ActionSheetIOS,
  AlertIOS,
  Easing,
  PushNotificationIOS,
  Linking
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from './auth.container';
import CreatePostContainer from '../components/createPost/createPost.container';
import Footer from './footer.container';
import ErrorContainer from './error.container';
import InvestAnimation from '../components/animations/investAnimation.component';
import HeartAnimation from '../components/animations/heartAnimation.component';
import StallScreen from '../components/stallScreen.component';
import * as authActions from '../actions/auth.actions';
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
import Tooltip from '../components/tooltip.component';

const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;


let ImagePicker = require('react-native-image-picker');

class Application extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      newName: null,
      buttons: [
        'Change display name',
        'Add new photo',
        'Logout',
        'Cancel',
      ],
      destructiveIndex: 2,
      cancelIndex: 3,
    };
    this.logoutRedirect = this.logoutRedirect.bind(this);
    this.backgroundTime = 0;
    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.configureTransition = this.configureTransition.bind(this);
    this.back = this.back.bind(this);
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
    PushNotificationIOS.setApplicationIconBadgeNumber(0);

    Linking.addEventListener('url', this.handleOpenURL);
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      this.props.actions.userToSocket(next.auth.user._id);
      this.props.actions.getNotificationCount();
      this.props.actions.getFeedCount();

      if (next.auth.user.onboarding === 0) {
        this.props.actions.changeTab('discover');
      } else this.props.actions.changeTab('read');
      this.props.actions.resetRoutes();

      this.props.actions.replaceRoute({
        key: 'tabBars',
        component: 'tabBars',
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
    Linking.removeEventListener('url', this._handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  handleOpenURL(event) {
    let params = event.url.split('?')[1];
    let paramsLookup = {};
    if (params) {
      params = params.split('&');
      params.forEach(p => {
        p = p.split('=');
        paramsLookup[p[0]] = p[1];
      });
    }
    console.log(paramsLookup);
  }

  changeName() {
    console.log('change name');
    let user = this.props.auth.user;
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
            this.props.actions.updateUser(user, this.props.auth.token);
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
            this.props.actions.updateUser(newUser, this.props.auth.token);
            setTimeout(() => this.props.actions.getSelectedUser(newUser._id), 250);
          } else {
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
    ActionSheetIOS.showActionSheetWithOptions({
      options: this.state.buttons,
      cancelButtonIndex: this.state.cancelIndex,
      destructiveButtonIndex: this.state.destructiveIndex,
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
      PushNotificationIOS.setApplicationIconBadgeNumber(0);

      // refresh after 5 minutes of inactivity
      let now = new Date().getTime();
      if (this.backgroundTime + (5 * 60 * 1000) < now) {
        // reload current tab
        this.props.actions.reloadTab();
        // reload all other tabs on focus
        this.props.actions.reloadAllTabs();
        this.props.actions.resetRoutes();
        // this.props.actions.getUser();
      }
    } else if (currentAppState === 'background') {
      this.backgroundTime = new Date().getTime();
    }
  }

  renderScene(props) {
    let component = props.scene.route.component;

    switch (component) {
      case 'auth':
        return <Auth authType={component} navProps={props} navigator={this.props.actions} />;
      case 'createPost':
        return (<CreatePostContainer step={'url'} navProps={props} navigator={this.props.actions} />);
      case 'categories':
        return (<CreatePostContainer step={'url'} navProps={props} navigator={this.props.actions} />);
      case 'tabBars':
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
    const easing = Easing.out(Easing.ease);
    return {
      duration: 350,
      easing,
      useNativeDriver: !!NativeAnimatedModule ? true : false
    };
  }

  back() {
    this.props.actions.pop('home');
  }

  render() {
    let scene = this.props.navigation;

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }} >
        <NavigationTransitioner
          style={{ backgroundColor: 'black' }}
          navigationState={scene}
          configureTransition={this.configureTransition}
          render={transitionProps => {
            return transitionProps.scene.route.ownCard ? this.renderScene(transitionProps) :
            (<Card
              {...transitionProps}
              renderScene={this.renderScene}
              back={this.back}
              {...this.props}
              header={false}
            />);
          }
        }
        />
        <Tooltip />
        <InvestAnimation />
        <HeartAnimation />
        <IrrelevantAnimation />
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
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);
