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
var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
import * as postActions from '../actions/postActions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import { pickerOptions } from '../pickerOptions';

class Profile extends Component {
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
          var promise = utils.s3.toS3Advanced(data, 'profilepic', user, self.props.auth.token);
          promise.then(function(results){
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
    }

    function changeBio() {
      actions.changeBio(self.state.newBio, user, self.props.auth.token);
      self.setState({newBio: ''});
    }

    function changeName() {
      actions.changeName(self.state.newName, user, self.props.auth.token);
      self.setState({newName: '', editing: false});
    }

    function startEditing() {
      self.setState({editing: true});
    }

    var placeholder = 'enter a short bio';

    if (user.bio) {
      placeholder = user.bio;
    }

    var changeNameEl = null;
    var postsEl = null;

    if (self.state.editing) {
      changeNameEl = (<View style={styles.pictureWidth}><TextInput style={styles.input} placeholder={user.name} onChangeText={(newName) => this.setState({newName})} value={this.state.newName} onSubmitEditing={changeName} returnKeyType='done' />
      <Button onPress={changeName} style={styles.selfCenter}>Submit</Button></View>);
    } else {
      changeNameEl = (<View style={styles.pictureWidth}><Text style={styles.twenty}>{self.props.auth.user.name}</Text>
      <Button onPress={startEditing}>Edit</Button></View>);
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
        {/*changeNameEl*/}
        <View style={styles.row}>
          <View style={styles.insideRow}>{userImageEl}</View>
          <View style={styles.insideRow}>
            <Text>blah blah</Text>
            <Text>Blah ballllshahsahsaks</Text>
          </View>
        </View>
        {/*<Button onPress={chooseImage}>Update profile picture</Button>
        <Button onPress={self.props.routes.Auth}>Home</Button>*/}
        <View style={styles.column}>
          <Text style={styles.twenty}>Posts</Text>
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

const styles = StyleSheet.create({
  uploadAvatar: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
    borderRaidus: 100
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    width: width,
    padding: 20
  },
  column: {
    flexDirection: 'column',
    width: width,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  insideRow: {
    flex: 1,
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  twenty: {
    fontSize: 20
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
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
    width: 200
  },
  marginTop: {
    marginTop: 10
  },
  selfCenter: {
    // alignSelf: 'center'
  }
});

