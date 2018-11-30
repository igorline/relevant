import React, { Component } from 'react';
import { img, s3, Alert } from '../../../utils';

export default class ImageUpload extends Component {
  state = {
    preview: null,
    fileName: null,
  }

  processImage() {
    const file = this.fileInput.files[0];
    img.loadImage(file)
    .then(dataURL => {
      let extension = dataURL.split(',')[0].split('/')[1].split(';')[0];
      file.name = file.name.substr(0, extension.lastIndexOf('.')) + '.' + extension;
      this.setState({ preview: dataURL, fileName: file.name });
    }).catch((e) => {
      console.log(e);
    });
  }

  async uploadImage() {
    if (!this.state.fileName || !this.state.preview) {
      Alert('Please select an image');
      return null;
    }
    let res = await s3.toS3Advanced(this.state.preview, this.state.fileName);
    console.log('uploaded url ', res.url);
    this.setState({ preview: null, fileName: null });
    // this.props.onUpload();
  }

  render() {
    let { preview } = this.state;

    return (
      <div>
        {preview ? <img src={preview} /> : null }
        <input
          ref={c => (this.fileInput = c)}
          onChange={this.processImage.bind(this)}
          accept={'image/*'}
          name={'img'}
          type={'file'}
        />
        <div>
        </div>
{/*        {preview ? <button onClick={this.uploadImage.bind(this)}>Upload</button> : null }
*/}      </div>
    );
  }
}
