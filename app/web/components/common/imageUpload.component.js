import React, { Component } from 'react';
import { img, s3 } from '../../../utils';

export default class ImageUpload extends Component {
  state = {
    preview: null,
    fileName: null,
  }

  processImage() {
    const file = this.fileInput.files[0];
    console.log(file);

    img.loadImage(file)
    .then(dataURL => {
      this.setState({ preview: dataURL, fileName: file.name });
    }).catch(() => {
      console.log('invalid image');
    });
  }

  uploadImage() {
    s3.toS3Advanced(this.state.preview, this.state.fileName)
    .then(res => {
      console.log('uploaded url ', res.url);
      this.props.onUpload(res.url);
      this.setState({ preview: null, fileName: null });
    });
  }

  render() {
    let { preview } = this.state;

    return (
      <div>
        <input
          ref={c => (this.fileInput = c)}
          onChange={this.processImage.bind(this)}
          accept={'image/*'}
          name={'img'}
          type={'file'}
        />
        <div>
          {preview ? <img src={preview} /> : null }
        </div>
        {preview ? <button onClick={this.uploadImage.bind(this)}>Upload</button> : null }
      </div>
    );
  }
}
