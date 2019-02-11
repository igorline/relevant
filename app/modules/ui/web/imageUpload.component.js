import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { img, s3, alert } from 'app/utils';
import { View } from 'modules/styled/uni';

const Alert = alert.Alert();

export default class ImageUpload extends Component {
  static propTypes = {
    placeholder: PropTypes.node,
    imageComponent: PropTypes.node
  };

  state = {
    preview: null,
    fileName: null
  };

  processImage() {
    const file = this.fileInput.files[0];
    img
    .loadImage(file)
    .then(dataURL => {
      const extension = dataURL
      .split(',')[0]
      .split('/')[1]
      .split(';')[0];
      const name = file.name.substr(0, extension.lastIndexOf('.')) + '.' + extension;
      this.setState({ preview: dataURL, fileName: name });
    })
    .catch(e => {
      // console.log(e);
      Alert.alert('Error uploading image ' + e);
    });
  }

  async uploadImage() {
    if (!this.state.fileName || !this.state.preview) {
      Alert('Please select an image');
      return null;
    }
    const upload = await s3.toS3Advanced(this.state.preview, this.state.fileName);
    this.setState({ preview: null, fileName: null });
    return upload;
  }

  renderPreview() {
    const { placeholder, imageComponent } = this.props;
    const { preview } = this.state;
    if (!preview && placeholder) {
      return placeholder;
    }
    if (preview && imageComponent) {
      const imageComponentWithProps = React.cloneElement(imageComponent, {
        source: { uri: preview }
      });
      return imageComponentWithProps;
    }
    if (preview) {
      return <img src={preview} style={{ maxWidth: '300px' }} />;
    }
    return null;
  }

  render() {
    const previewImage = this.renderPreview();

    return (
      <View display="flex" fdirection="row" align="center">
        <View mr={2}>{previewImage}</View>
        <input
          ref={c => (this.fileInput = c)}
          onChange={this.processImage.bind(this)}
          accept={'image/*'}
          name={'img'}
          type={'file'}
        />
      </View>
    );
  }
}
