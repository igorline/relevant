import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Dimensions,
  AlertIOS,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { globalStyles, fullHeight, fullWidth } from '../styles/global';
import { pickerOptions } from '../utils/pickerOptions';
import * as utils from '../utils';

let localStyles;
let styles;
let ImagePicker = require('react-native-image-picker');

class ImageUpload extends Component {
  constructor(props, context) {
    super(props, context);
    // this.back = this.back.bind(this);
    // this.validate = this.validate.bind(this);
    this.createUser = this.createUser.bind(this);
    this.initImage = this.initImage.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.state = {
      image: null,
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
  }

  initImage() {
    this.chooseImage((err, data) => {
      if (err) {
        console.log(err); 
        return;
      }
      if (data) {
        console.log(data, 'data');
        // utils.s3.toS3Advanced(data, this.props.auth.token).then((results) => {
        //   if (results.success) {
        //     let newUser = this.props.auth.user;
        //     newUser.image = results.url;
        //     this.props.actions.updateUser(newUser, this.props.auth.token).then((res) => {
        //       if (res) this.props.actions.getUser();
        //     });
        //   } else {
        //     console.log('image error ', results);
        //   }
        // });
      }
    });
  }

  chooseImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, (response) => {
      if (response.didCancel) {
        callback('cancelled');
      } else if (response.error) {
        callback('error');
      } else if (response.customButton) {
        callback('error');
      } else {
        callback(null, response.uri);
      }
    });
  }

  createUser() {
    console.log('create user');
    // this.props.actions.createUser(this.props.auth.preUser);
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
     <View style={{ padding: 20, flex: 1 }}>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          style={{ width: 200, height: 200 }}
          resizeMode={'cover'}
          source={require('../assets/images/camera.png')}
        />
      </View>

      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.largeButton]}
        onPress={this.initImage}
      >
        <Text style={styles.largeButtonText}>upload image</Text>
      </TouchableHighlight>

      {/*<TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.largeButton, { marginTop: 10 }]}
      >
        <Text style={styles.largeButtonText}>choose a photo</Text>
      </TouchableHighlight>*/}

      <TouchableHighlight
        onPress={this.createUser}
        underlayColor={'transparent'}
      >
        <Text style={styles.signInText}>
          <Text style={{ color: '#3E3EFF' }}>Skip</Text> for now
        </Text>
      </TouchableHighlight>
     </View>
    );
  }
}

ImageUpload.propTypes = {
  actions: React.PropTypes.object,
};

localStyles = StyleSheet.create({
});


export default ImageUpload;

