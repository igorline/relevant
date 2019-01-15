import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Platform,
  ActionSheetIOS,
  Alert,
  AlertIOS
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import Prompt from 'rn-prompt';
import {
  StackActions,
  NavigationActions,
} from 'react-navigation';
import {
  globalStyles,
  darkGrey,
  mainPadding,
} from 'app/styles/global';
import Stats from 'modules/stats/mobile/stats.component';
import RNBottomSheet from 'react-native-bottom-sheet';

import { pickerOptions } from 'app/utils/pickerOptions';
import { toS3Advanced } from 'app/utils/s3';
import ImagePicker from 'react-native-image-picker';

import * as userActions from 'modules/user/user.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as authActions from 'modules/auth/auth.actions';

let styles;

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

class HeaderRight extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object,
    navigation: PropTypes.object,
  }

  state = {
    newName: ''
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
        toS3Advanced(data, this.props.auth.token).then(results => {
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
    ImagePicker.showImagePicker(pickerOptions, res => {
      if (res.didCancel) return callback('Cancelled');
      if (res.error || res.customButton) return callback('There was an error');
      return callback(null, res.uri);
    });
  }

  showActionSheet = () => {
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
    this.props.actions.logoutAction(this.props.auth.user, this.props.auth.token);
    const resetAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({
        routeName: 'container',
        action: [NavigationActions.navigate({ routeName: 'auth' })]
      })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  renderElement() {
    const { navigation, auth } = this.props;
    const { state } = navigation;

    if (state.routeName === 'myProfileView') {
      return (
        <TouchableHighlight
          style={styles.gear}
          underlayColor={'transparent'}
          onPress={() => this.showActionSheet()}
        >
          {
            Platform.OS === 'ios' ?
              <Text style={{ paddingBottom: 5, fontSize: 17 }}>⚙️</Text> :
              <Icon name="ios-settings-outline" size={24} color={darkGrey} />
          }
        </TouchableHighlight>
      );
    }

    if (auth.user) {
      return (
        <Stats
          type={'nav'}
          discover={state.routeName === 'discoverView'}
          parent={this}
          entity={auth.user}
        />
      );
    }
    return null;
  }

  render() {
    const { auth, actions } = this.props;
    return (
      <View style={styles.rightButton}>
        <View style={{ paddingRight: 10 }}>{this.renderElement()}</View>
        <Prompt
          title={this.promptTitle || ''}
          visible={this.state.promptVisible}
          onCancel={() => this.setState({ promptVisible: false })}
          onSubmit={newName => {
            auth.user.name = newName;
            actions.updateUser(auth.user);
            this.setState({
              promptVisible: false,
              newName
            });
          }}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  rightButton: {
    flex: 1,
    marginRight: mainPadding - 10,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
});

styles = { ...localStyles, ...globalStyles };


function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
        ...userActions,
        ...authActions,
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderRight);
