import React, { Component } from 'react';
import {
  View,
  AppState,
  ActionSheetIOS,
  AlertIOS,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from './auth.container';
import Footer from './footer.container';
import InvestAnimation from '../components/investAnimation.component';
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

      this.props.actions.getInvestments(next.auth.token, next.auth.user._id, 0, 10, true);
      this.props.actions.getUserPosts(0, 5, next.auth.user._id, true);
    }

    if (!this.props.auth.token && next.auth.token) {
      this.props.actions.changeTab(0);
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

  render() {
    if (this.props.auth.token) {
      return (
        <View style={{ flex: 1 }} >
          <Footer showActionSheet={this.showActionSheet} />
          <InvestAnimation {...this.props} />
        </View>
      );
    }
    else {
      return (
        <View style={{ flex: 1 }}>
          <Auth />
        </View>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
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
