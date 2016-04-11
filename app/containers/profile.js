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
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      newName: '',
      editing: false
    }
  }

  componentDidMount() {
   this.props.actions.getUserPosts(this.props.auth.user._id);
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    var name = null;
    var relevance = null;
    if (this.props.auth.user) {
      user = this.props.auth.user;
      if (user.name) name  = this.props.auth.user.name;
      if (user.image) userImage = this.props.auth.user.image;
      if (this.props.auth.user.relevance) {
        relevance = this.props.auth.user.relevance;
      } else {
        relevance = 0;
      }
    }

    const { actions } = this.props;

    function chooseImage() {
      pickImage(function(err, data){
        if(data){
          utils.s3.toS3Advanced(data).then(function(results){
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
      fetch('http://localhost:3000/api/user/image', {
          credentials: 'include',
          method: 'PUT',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              _id: user._id,
              imageUrl: url
          })
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

    if (userImage) {
      userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} />)
    } else {
      userImageEl = (<Button onPress={chooseImage}>Update profile picture</Button>);
    }

    var postsEl = null;

    if (self.props.posts.userPosts) {
      postsEl = self.props.posts.userPosts.map(function(post, i) {
        return (<Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.title ? post.title : 'Untitled'}</Text>);
      });
    } else {
      postsEl = (<View><Text>0 Posts</Text></View>)
    }

    return (
      <View style={styles.profileContainer}>
        <View style={styles.row}>
          <View>{userImageEl}</View>
          <View style={[styles.insideRow, styles.insidePadding]}>
            <Text>Relevance: <Text style={styles.active}>{relevance}</Text></Text>
            <Text>more info more info</Text>
          </View>
        </View>
        <View style={styles.column}>
          <Text style={styles.font20}>Posts</Text>
          {postsEl}
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile)

const localStyles = StyleSheet.create({
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    width: fullWidth,
    padding: 20
  },
  column: {
    flexDirection: 'column',
    width: fullWidth,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});

var styles = {...localStyles, ...globalStyles};

