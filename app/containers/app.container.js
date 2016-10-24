import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  AppState,
  TouchableHighlight,
  ActionSheetIOS,
  AlertIOS,
  Image,
  NavigationExperimental
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, fullWidth } from '../styles/global';
import Auth from './auth.container';
import Footer from './footer.containerNew';
// import CardContainer from './card.container';

import InvestAnimation from '../components/investAnimation.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';
import * as navigationActions from '../actions/navigation.actions';
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';

const { CardStack: NavigationCardStack } = NavigationExperimental;

let styles;

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
      routes: [
        { name: 'auth' },
      ],
    };

    this.showActionSheet = this.showActionSheet.bind(this);
    this.renderScene = this.renderScene.bind(this)
  }

  componentDidMount() {
    const self = this;
    AppState.addEventListener('change', this.handleAppStateChange.bind(self));
    this.props.actions.changeTab(0);
  }

  componentWillReceiveProps(next) {

    if (!this.props.auth.user && next.auth.user) {
      this.props.actions.userToSocket(next.auth.user);
      this.props.actions.getActivity(next.auth.user._id, 0);
      this.props.actions.getGeneralActivity(next.auth.user._id, 0);
      this.props.actions.getMessages(next.auth.user._id);
      this.props.actions.setSelectedUser(next.auth.user._id);
      this.props.actions.setSelectedUserData(next.auth.user);
      this.props.actions.changeTab(1);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const self = this;
    if (!self.state.newName && nextState.newName) {
      let user = self.props.auth.user;
      user.name = nextState.newName;
      self.props.actions.updateUser(user, self.props.auth.token).then((results) => {
        if (results) self.props.actions.getUser(self.props.auth.token, false);
      });
    }
  }

  componentWillUnmount() {
    const self = this;
    AppState.removeEventListener('change', this.handleAppStateChange.bind(self));
  }

  getTitle(route) {
    let title = '';
    switch (route.name) {
      case 'singlePost':
        this.props.posts.activePost.title ? title = this.props.posts.activePost.title : title = 'Untitled Post';
        break;
    }
    return title;
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
            console.log(results);
          }
        });
      }
    });
  }


  pickImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        callback('cancelled');
      } else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        callback('error');
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
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

    // TODO
    this.actions.replace({ name: 'auth' });
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
    let key = props.scene.route.key;

    if (this.props.auth.user) key = null;

    switch (key) {
      case 'auth':
        return <Auth authType={key} />;
      case 'login':
        return <Auth authType={key} />;
      case 'signup':
        return <Auth authType={key} />;
      default:
        return <Footer showActionSheet={this.showActionSheet} />;
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
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    online: state.online,
    notif: state.notif,
    animation: state.animation,
    view: state.view,
    messages: state.messages,
    stats: state.stats,
    investments: state.investments,
    navigation: state.navigation.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...statsActions,
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...animationActions,
      ...viewActions,
      ...messageActions,
      ...tagActions,
      ...userActions,
      ...investActions,
      ...subscriptionActions,
      ...navigationActions
    }, dispatch)
  };
}

const localStyles = StyleSheet.create({
  back: {
    position: 'absolute',
    top: 0,
    left: 5,
    height: 60,
    padding: 12,
    flex: 1,
    justifyContent: 'flex-end'
  },
  backInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backImg: {
    height: 10,
    width: 7,
    backgroundColor: 'transparent',
    marginRight: 4
  },
  backText: {
    color: '#aaaaaa',
    fontSize: 12
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)'
  },
  stats: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  navItem: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    backgroundColor: 'transparent',
    fontSize: 15,
    textAlign: 'center',
  },
  maxWidth: {
    width: (fullWidth / 1.25),
  }
});

styles = { ...localStyles, ...globalStyles };

export default connect(mapStateToProps, mapDispatchToProps)(Application);
