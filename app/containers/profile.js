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

var FileUpload = require('NativeModules').FileUpload;
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
      newName: ''
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
      pickImage(function(err, data){
        if(data){
          // var blob = dataURItoBlob(data);
          toS3Advanced(data);
        }
      });
    }


    function pickImage(callback){
        ImagePickerManager.showImagePicker(pickerOptions, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          callback("cancelled");
        }
        else if (response.error) {
          console.log('ImagePickerManager Error: ', response.error);
          callback("error");
        }
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
          callback("error");
        }
        else {
          const source = {uri: response.uri.replace('file://', ''), isStatic: true};
          const data = response.data;
          var alter = "data:image/jpeg;base64,"+data;
          // toS3Advanced(source.uri);
          // console.log("data", data);
          callback(null, response.uri);
        }
      });
    }

    function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
    }


    // function dataURItoBlob(dataURI) {

    //   // base64 string
    //   var base64str = dataURI;

    //   // decode base64 string, remove space for IE compatibility
    //   var binary = atob(base64str.replace(/\s/g, ''));

    //   // get binary length
    //   var len = binary.length;

    //   // create ArrayBuffer with binary length
    //   var buffer = new ArrayBuffer(len);

    //   // create 8-bit Array
    //   var view = new Uint8Array(buffer);

    //   // save unicode of binary data into 8-bit Array
    //   for (var i = 0; i < len; i++) {
    //    view[i] = binary.charCodeAt(i);
    //   }

    //   console.log('view', view)
    //   // create the blob object with content-type "application/pdf"
    //   var blob = new Blob( [view], { type: "image/jpeg" });
    //   console.log("blob", blob);
    //   var file = new File([blob], "default.jpg", {type: 'image/jpeg'});
    //   console.log("file", file);
    //   toS3Advanced(file);
    // }

    function toS3Advanced(blob) {

      var file = new File([blob], "default.jpg", {type: 'image/jpeg'});


      var s3_sign_put_url = 'http://'+ process.env.SERVER_IP + ':3000/api/s3/sign';
      var s3_object_name = 'xxx'+ Math.random().toString(36).substr(2, 9) + "_" + 'xxx.jpg';
      executeOnSignedUrl(file);

      function executeOnSignedUrl(file) {
        fetch(s3_sign_put_url + '?s3_object_type=' + 'multipart/FormData' + '&s3_object_name=' + s3_object_name, {
          credentials: 'include',
          method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJSON) => {
          // console.log(responseJSON, 'execute on signed url response');
          uploadToS3(file, responseJSON.signature.s3Policy, responseJSON.signature.s3Signature, responseJSON.url , responseJSON.url);
          //fileUpload(file, responseJSON.signed_request);
        })
        .catch((error) => {
          console.log(error, 'error');
        });
      };


      function uploadToS3(file, policy, signature, url, publicUrl) {

        var body = new FormData();
        // body.append('uri', blob)
        body.append("key", s3_object_name)
        body.append("AWSAccessKeyId", "AKIAIN6YT3LQ4EMODDQA")
        body.append('acl', 'public-read')
        body.append("success_action_status", "201")
        body.append('Content-Type', 'image/jpeg')
        body.append('policy', policy)
        body.append('signature', signature)
        body.append(file, {uri: blob, name: s3_object_name})

        console.log('body',body);

        // console.log(file, 'uploading this')
        fetch("https://relevant-images.s3.amazonaws.com/", {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/FormData'
          },
          body: body
        })
        .then((response) => {
          console.log(response, 'upload response')
          setPicture(publicUrl);
        })
        // .then((responseJSON) => {
        //   console.log(responseJSON, 'upload to s3 response');
        // })
        .catch((error) => {
          console.log(error);
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

    var edited = false;

    function changeBio() {
      actions.changeBio(self.state.newBio, user, self.props.auth.token);
      self.setState({newBio: ''});
    }

    function changeName() {
      actions.changeName(self.state.newName, user, self.props.auth.token);
      self.setState({newName: ''});
    }

    var placeholder = 'enter a short bio';

    if (user.bio) {
      placeholder = user.bio;
    }

    return (
      <View style={styles.container}>
       {userImageEl}
          <TextInput style={styles.input} placeholder={user.name} onChangeText={(newName) => this.setState({newName})} value={this.state.newName} onSubmitEditing={changeName} returnKeyType='done' />
          <TextInput style={styles.input} placeholder={placeholder} onChangeText={(newBio) => this.setState({newBio})} value={this.state.newBio} onSubmitEditing={changeBio} returnKeyType='done' />
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
  flex: {
    flexDirection: 'row',
    alignItems: 'center'
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
    width: 200,
    alignSelf: 'center',
    margin: 5
  },
  marginTop: {
    marginTop: 10
  }
});

