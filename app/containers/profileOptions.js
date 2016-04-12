'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';

class ProfileOptions extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      newName: '',
      editing: false
    }
  }

  componentDidMount() {
    if (!this.props.posts.index) this.props.actions.getUserPosts(this.props.auth.user._id);
  }

  render() {
    var self = this;
    var user = null;
    console.log(self, 'profile options')
    var userImage = null;
    var name = null;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (this.props.auth.user.name) {
        name = this.props.auth.user.name;
      }
      if (this.props.auth.user.image) {
        userImage = this.props.auth.user.image;
      }
    }

    const { actions } = this.props;

    function logoutRedirect() {
      logout();
      self.props.routes.Auth();
    }

    function chooseImage() {
      pickImage(function(err, data){
        if(data){
          utils.s3.toS3Advanced(data, self.props.auth.token).then(function(results){
            if (results.success) {
              setPicture(results.url, user, self.props.auth.token);
            } else {
              console.log('err');
            }
          })
        }
      });
    }

    function setPicture(url, user, token) {
      var newUser = user;
      newUser.image = url;

      fetch('http://'+process.env.SERVER_IP+':3000/api/user?access_token='+token, {
          credentials: 'include',
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
      })
      .then((response) => {
        console.log('yes')
        actions.getUser(token, null);
      })
      .catch((error) => {
          console.log(error, 'error');
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
          callback(null, response.uri);
        }
      });
    }


    var userImageEl = null;
    console.log(userImage, 'userImage')
    if (userImage) {
      userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} />)
    } else {
      userImageEl = (<Button onPress={chooseImage}>Update profile picture</Button>);
    }

    function changeBio() {
      actions.changeBio(self.state.newBio, user, self.props.auth.token);
      self.setState({newBio: ''});
    }

    function changeName() {
      var newUser = user;
      newUser.name = self.state.newName;
      actions.changeName(self.state.newName, newUser, self.props.auth.token);
      self.setState({newName: '', editing: false});
    }

    function startEditing() {
      self.setState({editing: true});
    }

    var placeholder = 'enter a short bio';

    var changeNameEl = null;
    var postsEl = null;

const { isAuthenticated} = this.props.auth;
    if(isAuthenticated){
    if (self.state.editing) {
      changeNameEl = (<View style={styles.center}><TextInput style={styles.input} placeholder={user.name} onChangeText={(newName) => this.setState({newName})} value={this.state.newName} onSubmitEditing={changeName} returnKeyType='done' />
      <Button onPress={changeName} style={styles.selfCenter}>Submit</Button></View>);
    } else {
      changeNameEl = (<View style={styles.center}><Text style={styles.font20}>{name}</Text>
      <Button onPress={startEditing}>Edit</Button></View>);
    }
  }

    if (self.props.posts.userPosts) {
      postsEl = self.props.posts.userPosts.map(function(post, i) {
      return (
          <Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.body}</Text>

      );
    });
    } else {
      postsEl = (<View><Text>0 Posts</Text></View>)
    }
      const { logout } = this.props.actions;

    return (
      <View style={styles.container}>
        {changeNameEl}
        {userImageEl}
        <Button onPress={chooseImage}>Update profile picture</Button>
        <Button onPress={self.props.routes.Import}>Find users from contacts</Button>
        <Button onPress={logoutRedirect}>Logout</Button>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileOptions)

const localStyles = StyleSheet.create({
uploadAvatar: {
  height: 200,
  width: 200
}
});

var styles = {...localStyles, ...globalStyles};

