import React, { Component } from 'react';
import { StyleSheet, TextInput, View, TouchableHighlight, Image, Text } from 'react-native';
import PropTypes from 'prop-types';
import ImagePicker from 'react-native-image-picker';
import { globalStyles } from '../../styles/global';
import * as utils from '../../utils';
import { pickerOptions } from '../../utils/pickerOptions';
import UrlPreview from './urlPreview.component';

let styles;

export default class CreatePostComponent extends Component {
  static propTypes = {
    postTags: PropTypes.array,
    bodyTags: PropTypes.array,
    urlPreview: PropTypes.object,
    actions: PropTypes.object,
    postImage: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.chooseImage = this.chooseImage.bind(this);
    this.updateTags = this.updateTags.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  componentWillMount() {
    this.currentTags = this.props.postTags;
    if (!this.props.postTags.length) this.currentTags = this.props.bodyTags;
    if (this.currentTags) {
      this.currentTags = this.currentTags.toString().replace(/,/g, ', ');
      this.updateTags(this.currentTags);
    }
  }

  chooseImage() {
    this.pickImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data).then(results => {
          if (results.success) {
            if (this.props.urlPreview) {
              const urlPreview = { ...this.props.urlPreview, image: results.url };
              this.props.actions.setCreaPostState({ urlPreview });
            } else {
              const postImage = results.url;
              this.props.actions.setCreaPostState({ postImage });
            }
          } else {
            console.log('err');
          }
        });
      }
    });
  }

  pickImage(callback) {
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

  removeImage() {
    this.props.actions.setCreaPostState({ postImage: null });
  }

  updateTags(tags) {
    const noSpaces = tags.replace(/\s*,\s*/g, ',');
    const postTags = noSpaces.split(',');
    this.props.actions.setCreaPostState({ postTags });
    this.currentTags = tags;
  }

  render() {
    const tagsInput = (
      <View style={[styles.createPostInput, styles.linkInput]}>
        <TextInput
          style={[styles.font15, { flex: 1 }]}
          placeholder={'Enter tags... ex. webgl, slowstyle, xxx'}
          multiline={false}
          onChangeText={postTags => this.updateTags(postTags)}
          value={this.currentTags}
          returnKeyType={'done'}
          autoCapitalize={'none'}
          autoFocus
        />
      </View>
    );

    const postImage = (
      <TouchableHighlight
        style={[styles.imageButton]}
        underlayColor={'transparent'}
        onPress={this.chooseImage}
      >
        <Text style={[styles.white]}>Upload an image</Text>
      </TouchableHighlight>
    );

    const imagePreview = (
      <View style={[styles.greyBottomBorder, styles.previewImageContainer]}>
        <Image source={{ uri: this.props.postImage }} style={styles.previewImage} />
        <TouchableHighlight style={[]} onPress={this.removeImage}>
          <Text>Remove image</Text>
        </TouchableHighlight>
      </View>
    );

    return (
      <View style={{ flex: 1, paddingBottom: 300 }}>
        {tagsInput}
        {postImage}
        {this.props.postImage && !this.props.urlPreview ? imagePreview : null}
        {this.props.urlPreview ? <UrlPreview {...this.props} actions={this.props.actions} /> : null}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  imageButton: {
    height: 50,
    justifyContent: 'center',
    paddingLeft: 10,
    marginTop: 10,
    backgroundColor: 'blue'
  },
  previewImageContainer: {
    flex: 0.3,
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems: 'center'
  },
  previewImage: {
    height: 100,
    width: 100,
    marginRight: 10
  }
});

styles = { ...localStyles, ...globalStyles };
