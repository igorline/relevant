'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';

import {
  Route,
  Router,
  Schema,
  TabBar,
  TabRoute
} from 'react-native-router-redux';


import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
// require('../aws-sdk.min.js');
// require('../secrets.js');

// AWS.config.update({accessKeyId: process.env.AWS_KEY, secretAccessKey: process.env.AWS_SECRET});
// AWS.config.region = 'us-west-1';

var pickerOptions = {
  title: 'Select Profile Picture', // specify null or empty string to remove the title
  cancelButtonTitle: 'Cancel',
  takePhotoButtonTitle: 'Take Photo...', // specify null or empty string to remove this button
  chooseFromLibraryButtonTitle: 'Choose from Library...', // specify null or empty string to remove this button
  // customButtons: {
  //   'Choose Photo from Facebook': 'fb', // [Button Text] : [String returned upon selection]
  // },
  cameraType: 'back', // 'front' or 'back'
  mediaType: 'photo', // 'photo' or 'video'
  videoQuality: 'high', // 'low', 'medium', or 'high'
  durationLimit: 10, // video recording max time in seconds
  // maxWidth: 100, // photos only
  // maxHeight: 100, // photos only
  aspectX: 2, // android only - aspectX:aspectY, the cropping image's ratio of width to height
  aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
  quality: 1, // 0 to 1, photos only
  angle: 0, // android only, photos only
  allowsEditing: false, // Built in functionality to resize/reposition the image after selection
  noData: false, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
  storageOptions: { // if this key is provided, the image will get saved in the documents directory on ios, and the pictures directory on android (rather than a temporary directory)
    skipBackup: true, // ios only - image will NOT be backed up to icloud
    path: 'images' // ios only - will save image at /Documents/images rather than the root
  }
};


class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      avatarSource: null
    }
  }

  componentDidMount() {
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (this.props.auth.user.image) {
        userImage = this.props.auth.user.image;
      }
    }
    console.log(this)
    const { actions } = this.props;

    function chooseImage() {
      ImagePickerManager.showImagePicker(pickerOptions, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        }
        else if (response.error) {
          console.log('ImagePickerManager Error: ', response.error);
        }
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        }
        else {
          const source = {uri: response.uri.replace('file://', ''), isStatic: true};
          self.setState({
            avatarSource: source
          });
          toS3(source.uri);
        }
      });
    }

    function toS3(file) {
      console.log(typeof file, 'file');
      if (file) {
          fetch('http://localhost:3000/api/s3', {
            credentials: 'include',
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify( {
              file: file
            })
          })
          .then((response) => response.json())
          .then((responseJSON) => {
            console.log(responseJSON);
            var filename = 'https://s3.amazonaws.com/relevant-images/' + responseJSON.filename;
            self.setState({"filename": filename});
            setPicture(filename);
          })
          .catch((error) => {
            console.log(error, 'error');
          });

      } else {
        console.log('nothing to upload')
      }
    }

    function setPicture(file) {
          fetch('http://localhost:3000/api/user/image', {
            credentials: 'include',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify( {
              _id: user._id,
              imageUrl: file
            })
          })
          // .then((response) => response.json())
          .then((response) => {
            actions.getUser(self.props.auth.token, null);
          })
          .catch((error) => {
            console.log(error, 'error');
          });
    }

    var userImageEl = null;

      if (userImage) {
        userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} />)
      }

    return (
      <View style={styles.container}>
       {userImageEl}
        <Text>{user ? user.name : null}</Text>
        <Text>{user ? user.email : null}</Text>
        <Button onPress={chooseImage}>Add pic</Button>
        <Button onPress={actions.routes.Auth()}>Home</Button>
      </View>
    );
  }
}
export default Profile

const styles = StyleSheet.create({
  uploadAvatar: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  }
});

