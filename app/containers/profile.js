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

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/authActions';
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

    if (self.state.editing) {
      changeNameEl = (<View style={styles.pictureWidth}><TextInput style={styles.input} placeholder={user.name} onChangeText={(newName) => this.setState({newName})} value={this.state.newName} onSubmitEditing={changeName} returnKeyType='done' />
      <Button onPress={changeName} style={styles.selfCenter}>Submit</Button></View>);
    } else {
      changeNameEl = (<View style={styles.pictureWidth}><Text style={styles.matchButton}>{self.props.auth.user.name}</Text>
      <Button onPress={startEditing}>Edit</Button></View>);
    }

    return (
      <View style={styles.container}>


      {changeNameEl}

       {userImageEl}
        {/*<View style={styles.wrap}>

        </View>*/}
          {/*<TextInput style={styles.input} placeholder={placeholder} onChangeText={(newBio) => this.setState({newBio})} value={this.state.newBio} onSubmitEditing={changeBio} returnKeyType='done' />*/}
        <Button onPress={chooseImage}>Update profile picture</Button>
        <Button onPress={self.props.routes.Auth}>Home</Button>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)

const styles = StyleSheet.create({
  uploadAvatar: {
    width: 250,
    height: 250
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
  pictureWidth: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  matchButton: {
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
    width: 250
  },
  marginTop: {
    marginTop: 10
  },
  selfCenter: {
    // alignSelf: 'center'
  }
});

