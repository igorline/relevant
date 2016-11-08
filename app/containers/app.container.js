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
import InvestAnimation from '../components/investAnimation.component';
import HeartAnimation from '../components/heartAnimation.component';
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

    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this);
  }

  componentDidMount() {
    const self = this;
    this.props.actions.getUser(null, true);
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
  }

  componentWillReceiveProps(next) {
    if (!this.props.auth.user && next.auth.user) {
      this.props.actions.userToSocket(next.auth.user);
      this.props.actions.getActivity(next.auth.user._id, 0);
      this.props.actions.getGeneralActivity(next.auth.user._id, 0);
      this.props.actions.getMessages(next.auth.user._id);
    }
    if (!this.props.auth.token && next.auth.token) {
      this.props.actions.changeTab('read');
      this.props.actions.push({
        key: 'tabBars'
      }, 'home');
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.newName && nextState.newName) {
      let user = this.props.auth.user;
      user.name = nextState.newName;
      this.props.actions.updateUser(user, this.props.auth.token)
      .then((results) => {
        if (results) this.props.actions.getUser(this.props.auth.token, false);
      });
    }
  }

  componentWillUnmount() {
    const self = this;
    AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  }

  changeName() {
    const self = this;
    console.log('change name');
    AlertIOS.prompt(
      'Enter new name',
      self.props.auth.user.name,
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: newname => self.setState({ newName: newname }) },
      ],
    );
  }

  chooseImage() {
    let self = this;
    self.pickImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, self.props.auth.token).then((results) => {
          if (results.success) {
            let newUser = self.props.auth.user;
            newUser.image = results.url;
            self.props.actions.updateUser(newUser, self.props.auth.token).then((res) => {
              if (res) self.props.actions.getUser(self.props.auth.token, false);
            });
          } else {
            console.log('image error ', results);
          }
        });
      }
    });
  }


  pickImage(callback) {
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
          this.chooseImage();
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
    this.props.actions.resetRoutes('home');
    // this.props.actions.pop('home');
  }

  // home button etc
  handleAppStateChange(currentAppState) {
    const self = this;
    if (currentAppState === 'active' && self.props.auth.user) {
      self.props.actions.userToSocket(self.props.auth.user);
      self.props.actions.getActivity(self.props.auth.user._id, 0);
      self.props.actions.getGeneralActivity(self.props.auth.user._id, 0);
    }
  }

  renderScene(props) {
    let component = props.scene.route.component;

    switch (component) {
      case 'auth':
        return <Auth authType={component} />;
      case 'login':
        return <Auth authType={component} />;
      case 'signup':
        return <Auth authType={component} />;
      case 'createPost':
        return <CreatePost step={'url'} navProps={props} navigator={this.props.actions} />;
      case 'categories':
        return <CreatePost step={'categories'} navProps={props} navigator={this.props.actions} />;
      case 'createPostFinish':
        return <CreatePost step={'post'} navProps={props} navigator={this.props.actions} />;
      case 'tabBars':
        return <Footer showActionSheet={this.showActionSheet} />;

      default:
        return null;
    }
  }

  render() {
    let scene = this.props.navigation;
    return (
      <View style={{ flex: 1 }} >
        <NavigationCardStack
          key={'scene_' + scene.key}
          direction={'horizontal'}
          navigationState={scene}
          renderScene={this.renderScene}
        />
        <InvestAnimation {...this.props} />
        <HeartAnimation {...this.props} />
      </View>
    );
  }

}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    animation: state.animation,
    navigation: state.navigation.home
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
