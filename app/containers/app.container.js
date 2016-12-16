import React, { Component } from 'react';
import {
  NavigationExperimental,
  View,
  AppState,
  ActionSheetIOS,
  AlertIOS,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from './auth.container';
import CreatePost from './createPost.container';
import Footer from './footer.container';
import ErrorContainer from './error.container';
import InvestAnimation from '../components/investAnimation.component';
import HeartAnimation from '../components/heartAnimation.component';
import StallScreen from '../components/stallScreen.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as investActions from '../actions/invest.actions';
import * as navigationActions from '../actions/navigation.actions';
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';

const {
  CardStack: NavigationCardStack,
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
    this.backgroundTime = 0;
    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this);
  }

  componentDidMount() {
    this.props.actions.getUser();
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    utils.token.get()
    .catch(() => {
      this.props.actions.replaceRoute({
        key: 'auth',
        component: 'auth'
      }, 0, 'home');
    });
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      this.props.actions.userToSocket(next.auth.user._id);
      this.props.actions.getNotificationCount();
      this.props.actions.changeTab('read');
      this.props.actions.replaceRoute({
        key: 'tabBars',
        component: 'tabBars'
      }, 0, 'home');
      this.props.actions.resetRoutes('home');
    }

    if (!this.props.error.universal && next.error.universal) {
      this.props.actions.replaceRoute({
        key: 'error',
        component: 'error',
      }, 0, 'home');
      this.props.actions.resetRoutes('home');
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.newName && nextState.newName) {
      let user = this.props.auth.user;
      user.name = nextState.newName;
      this.props.actions.updateUser(user, this.props.auth.token);
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange.bind(this));
  }

  changeName() {
    console.log('change name');
    AlertIOS.prompt(
      'Enter new name',
      this.props.auth.user.name,
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: newName => this.setState({ newName }) },
      ],
    );
  }

  updateUserName(newName) {
    this.setState({ newName })
    let newUser = this.props.auth.user;
    newUser.image = results.url;
    this.props.actions.updateUser(newUser, this.props.auth.token);
  }

  initImage() {
    this.chooseImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, this.props.auth.token).then((results) => {
          if (results.success) {
            let newUser = this.props.auth.user;
            newUser.image = results.url;
            this.props.actions.updateUser(newUser, this.props.auth.token);
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
    this.props.actions.logoutAction(this.props.auth.user, this.props.auth.token);
    this.props.actions.replaceRoute({
      key: 'auth',
      component: 'auth'
    }, 0, 'home');
    // setTimeout(() => this.props.actions.changeTab('read'), 1000);
  }

  // home button etc
  handleAppStateChange(currentAppState) {
    if (currentAppState === 'active' && this.props.auth.user) {
      this.props.actions.userToSocket(this.props.auth.user._id);
      this.props.actions.getNotificationCount();

      // refresh after 5 minutes of inactivity
      let now = new Date().getTime();
      if (this.backgroundTime + (5 * 60 * 1000) < now) {
        // reload current tab
        this.props.actions.reloadTab();
        // reload all other tabs on focus
        this.props.actions.reloadAllTabs();
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
      case 'login':
        return <Auth authType={component} navProps={props} navigator={this.props.actions} />;
      case 'signup':
        return <Auth authType={component} navProps={props} navigator={this.props.actions} />;
      case 'imageUpload':
        return <Auth authType={component} navProps={props} navigator={this.props.actions} />;
      case 'createPost':
        return <CreatePost step={'url'} navProps={props} navigator={this.props.actions} />;
      case 'categories':
        return <CreatePost step={'categories'} navProps={props} navigator={this.props.actions} />;
      case 'createPostFinish':
        return <CreatePost step={'post'} navProps={props} navigator={this.props.actions} />;
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

  render() {
    let scene = this.props.navigation;
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }} >
        <NavigationCardStack
          key={`scene_${scene.key}`}
          direction={'horizontal'}
          navigationState={scene}
          renderScene={this.renderScene}
          enableGestures={false}
          style={{ backgroundColor: 'white' }}
        />
        <InvestAnimation {...this.props} />
        <HeartAnimation />
      </View>
    );
  }

}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    animation: state.animation,
    navigation: state.navigation.home,
    error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...viewActions,
      ...messageActions,
      ...userActions,
      ...investActions,
      ...navigationActions
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);
