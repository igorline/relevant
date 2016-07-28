'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions,
  TouchableHighlight
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';
import Notification from '../components/notification.component';

class ProfileOptions extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      newName: '',
      editing: false
    }
  }

  chooseImage() {
    var self = this;
    console.log(self, 'chooseImage')
    self.pickImage(function(err, data){
      if(data){
        utils.s3.toS3Advanced(data, self.props.auth.token).then(function(results){
          if (results.success) {
            var newUser = self.props.auth.user;
            newUser.image = results.url;
            self.props.actions.updateUser(newUser, self.props.auth.token);
          } else {
            console.log('err');
          }
        })
      }
    });
  }


    pickImage(callback){
      var self = this;
      console.log(self, 'pickImage')
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

  logoutRedirect() {
    var self = this;
    self.props.actions.removeDeviceToken(self.props.auth);
    self.props.dispatch({type:'server/logout', payload: self.props.auth.user});
    self.props.actions.logoutAction(self.props.auth.user, self.props.auth.token);
    self.props.routes.Auth();
  }

  changeName() {
    var self = this;
    var newUser = self.props.auth.user;
    newUser.name = self.state.newName;
    self.props.actions.updateUser(newUser, self.props.auth.token);
    self.setState({newName: '', editing: false});
  }

  startEditing() {
    var self = this;
    self.setState({editing: true});
  }

  render() {
    var self = this;
    var user = null;
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

    var userImageEl = null;
    if (userImage) {
      userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} />)
    }

    var changeNameEl = null;
    var postsEl = null;

    const { isAuthenticated} = this.props.auth;

    if(isAuthenticated){
      if (self.state.editing) {
        changeNameEl = (<View style={styles.center}><TextInput style={styles.input} placeholder={user.name} onChangeText={(newName) => this.setState({newName})} value={this.state.newName} onSubmitEditing={self.changeName.bind(self)} returnKeyType='done' />
        <TouchableHighlight onPress={self.changeName.bind(self)} style={[styles.genericButton, styles.margin]}><Text style={styles.white}>Submit</Text></TouchableHighlight></View>);
      } else {
        changeNameEl = (<View style={styles.center}><Text style={styles.font20}>{name}</Text>
        <TouchableHighlight style={[styles.genericButton, styles.margin]} onPress={self.startEditing.bind(self)}><Text style={styles.buttonText}>Edit</Text></TouchableHighlight></View>);
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


    return (
      <View style={styles.container}>
        {changeNameEl}
        {userImageEl}
        <TouchableHighlight style={[styles.genericButton, styles.marginTop]} onPress={self.chooseImage.bind(self)}><Text style={styles.buttonText}>Update profile picture</Text></TouchableHighlight>
        {/*<Button onPress={self.props.routes.Import}>Find users from contacts</Button>*/}
        <TouchableHighlight style={[styles.genericButton, styles.marginTop]} onPress={self.logoutRedirect.bind(self)}><Text style={styles.buttonText}>Logout</Text></TouchableHighlight>
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
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
},
});

var styles = {...localStyles, ...globalStyles};

