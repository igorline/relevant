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
import { globalStyles, fullHeight, fullWidth } from '../../styles/global';
import { pickerOptions } from '../../utils/pickerOptions';
import * as utils from '../../utils';

let localStyles;
let styles;
let ImagePicker = require('react-native-image-picker');

class ImageUpload extends Component {
  constructor(props, context) {
    super(props, context);
    // this.back = this.back.bind(this);
    // this.validate = this.validate.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.createUser = this.createUser.bind(this);
    this.initImage = this.initImage.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.renderImage = this.renderImage.bind(this);
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
    const self = this;
    this.chooseImage((err, data) => {
      if (err) {
        console.log(err); 
        return;
      }
      if (data) {
        utils.s3.toS3Advanced(data, this.props.auth.token).then((results) => {
          if (results.success) {
            self.setState({ image: results.url });
          } else {
            console.log('image error ', results);
          }
        });
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

  createUser(user) {
    let newUser = { ...this.props.auth.preUser };
    newUser.image = this.state.image;
    this.props.actions.createUser(newUser);
  }

  renderImage() {
    console.log(this.state.image, 'state image')
    if (this.state.image) {
      return (<Image
        style={{ width: 200, height: 200 }}
        resizeMode={'cover'}
        source={{ uri: this.state.image }}
      />);
    }
    return (<Image
      style={{ width: 200, height: 200 }}
      resizeMode={'cover'}
      source={require('../../assets/images/camera.png')}
    />);
  }

  renderButtons() {
    if (this.state.image) {
      return (<View>
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
      </View>);
    }
    return (<TouchableHighlight
      underlayColor={'transparent'}
      style={[styles.largeButton]}
      onPress={this.initImage}
    >
      <Text style={styles.largeButtonText}>upload image</Text>
    </TouchableHighlight>);
  }

  render() {
    styles = { ...localStyles, ...globalStyles };

    return (
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {this.renderImage()}
        </View>
        {this.renderButtons()}
        <TouchableHighlight
          onPress={() => this.createUser(this.props.auth.preUser)}
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

