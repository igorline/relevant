import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { globalStyles, fullHeight } from '../../styles/global';
import * as utils from '../../utils';
import UrlPreview from './urlPreview.component';

let styles;
const URL_REGEX =  new RegExp(/^((https|http|ftp):\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i);

export default class UrlComponent extends Component {

  processInput(postBody) {
    if (!this.props.postUrl && postBody[postBody.length - 1] === ' ') {
      let words = postBody.split(' ');
      let postUrl = words.find(word => URL_REGEX.test(word.toLowerCase()));
      if (postUrl) {
        this.createPreview(postUrl);
        this.props.actions.setCreaPostState({ postUrl });
      }
    }

    let bodyTags = postBody.match(/#\S+/g);
    let bodyMentions = postBody.match(/@\S+/g);

    if (bodyTags) {
      bodyTags = bodyTags.map(tag =>
        tag.replace('#', '').replace(/(,|\.)\s*$/, ''));
    }
    if (bodyMentions) {
      bodyMentions = bodyMentions.map(name =>
        name.replace('@', '').replace(/(,|\.)\s*$/, ''));
    }

    this.props.actions.setCreaPostState({ postBody, bodyTags, bodyMentions });
  }

  createPreview(postUrl) {
    utils.post.generatePreview(postUrl.toLowerCase())
    .then((results) => {
      if (results) {
        let newBody = this.props.postBody.replace(`${postUrl} `, '');
        this.props.actions.setCreaPostState({
          postBody: newBody,
          urlPreview: {
            image: results.image,
            title: results.title ? results.title : 'Untitled',
            description: results.description,
          }
        });
      } else {
        this.props.actions.setCreaPostState({ postUrl: null });
      }
    });
  }

  render() {
    let input;

    input = (
      <View
        style={{
          marginBottom: 300,
          flex: 1 }}
      >
        <TextInput
          style={[styles.font15, styles.createPostInput, styles.flex1]}
          placeholder={'Enter URL here, you can also enter text for a text post'}
          multiline
          onChangeText={postBody => this.processInput(postBody)}
          onSubmitEditing={this.createPreview}
          value={this.props.postBody}
          returnKeyType={'default'}
          autoFocus
        />
        {this.props.urlPreview ?
          <UrlPreview {...this.props} actions={this.props.actions} /> :
          null
        }
      </View>
    );

    return (
      input
    );
  }
}

const localStyles = StyleSheet.create({
  inputBox: {
    flex: 1,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffffff'
  }
});

styles = { ...localStyles, ...globalStyles };


