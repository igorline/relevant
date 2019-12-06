import React, { Component } from 'react';
import { Text, View, TouchableHighlight, StyleSheet, Image, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import { pickerOptions } from 'app/utils/pickerOptions';
import * as utils from 'app/utils';
import CustomSpinnerRelative from 'modules/ui/mobile/customSpinnerRelative.component';
import ImagePicker from 'react-native-image-picker';

let localStyles;
let styles;

class ImageUpload extends Component {
  static propTypes = {
    auth: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.renderButtons = this.renderButtons.bind(this);
    this.createUser = this.createUser.bind(this);
    this.initImage = this.initImage.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.renderImage = this.renderImage.bind(this);
    this.state = {
      image: null,
      uploading: false
    };
  }

  initImage() {
    const self = this;
    this.chooseImage((err, data) => {
      if (err) return Alert.alert(err.message);
      if (data) {
        self.setState({ uploading: true });
        utils.s3.toS3Advanced(data, this.props.auth.token).then(results => {
          if (results.success) {
            self.setState({ image: results.url, uploading: false });
          } else {
            Alert.alert('image error ', results);
          }
        });
      }
      return null;
    });
  }

  chooseImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, response => {
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
    const { createUser } = this.props.actions;
    const { invitecode } = this.props.auth;
    const newUser = { ...this.props.auth.preUser };
    newUser.image = this.state.image;
    createUser(newUser, invitecode);
  }

  renderImage() {
    let source = null;
    if (!this.state.uploading) {
      if (this.state.image) source = { uri: this.state.image };
      else source = require('app/public/img/camera.png');
      return (
        <Image style={{ width: 200, height: 200 }} resizeMode={'cover'} source={source} />
      );
    }
    return null;
  }

  renderButtons() {
    if (this.state.image) {
      return (
        <View>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.largeButton]}
            onPress={this.initImage}
          >
            <Text style={styles.largeButtonText}>Choose different image</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.largeButton, { marginTop: 10 }]}
            onPress={this.createUser}
          >
            <Text style={styles.largeButtonText}>Create user</Text>
          </TouchableHighlight>
        </View>
      );
    }
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.largeButton]}
        onPress={this.initImage}
      >
        <Text style={styles.largeButtonText}>upload image</Text>
      </TouchableHighlight>
    );
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {this.renderImage()}
          <CustomSpinnerRelative visible={this.state.uploading} />
        </View>
        {this.renderButtons()}
        <TouchableHighlight
          onPress={() => this.createUser()}
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
  actions: PropTypes.object
};

localStyles = StyleSheet.create({});

export default ImageUpload;
