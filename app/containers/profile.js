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
// require('../secrets');
require('../publicenv');
import { pickerOptions } from '../pickerOptions';

class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
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
          toS3Advanced(source.uri);
          //toS3(source.uri);
        }
      });
    }

    function toS3(file) {
      if (file) {
          fetch('http://localhost:3000/api/s3/upload', {
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

    function toS3Advanced(file) {
      var s3_sign_put_url = 'http://'+ process.env.SERVER_IP + ':3000/api/s3/sign';
      var s3_object_name = 'images/'+'xxx'+ Math.random().toString(36).substr(2, 9) + "_" + 'xxx.jpg';
      executeOnSignedUrl(file);

      function executeOnSignedUrl(file) {
        fetch(s3_sign_put_url + '?s3_object_type=' + file.type + '&s3_object_name=' + s3_object_name, {
          credentials: 'include',
          method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON, 'execute on signed url response');
          uploadToS3(file, responseJSON.signed_request);
        })
        .catch((error) => {
          console.log(error, 'error');
        });
      };

      function uploadToS3(file, url) {
        console.log('upload to s3');
        console.log(url, 'url');
        console.log(file, 'file');

        fetch(url, {
          method: 'PUT',
        })
        .then((response) => {
          console.log(response, 'upload response')
        })
        // .then((responseJSON) => {
        //   console.log(responseJSON, 'upload to s3 response');
        // })
        .catch((error) => {
          console.log(error, 'error');
        });
      };
    }

    function setPicture(file) {
          fetch('http://'+process.env.SERVER_IP+':3000/api/user/image', {
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

