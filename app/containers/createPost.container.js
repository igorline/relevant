'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableHighlight,
  Dimensions,
  AlertIOS,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { pickerOptions } from '../utils/pickerOptions';
import * as viewActions from '../actions/view.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';

const ImagePicker = require('react-native-image-picker');
const localStyles = StyleSheet.create({
  tagStringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  padding10: {
    padding: 10,
  },
  previewImage: {
    height: 25,
    width: 25,
    marginRight: 10,
  },
  list: {
    flex: 1,
    width: fullWidth,
    padding: 10,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  postError: {
    color: 'red',
  },
  nextButton: {
    width: fullWidth,
    textAlign: 'center',
    padding: 10,
  },
  postInput: {
    height: 50,
    padding: 10,
    width: fullWidth,
    textAlign: 'center',
  },
  bodyInput: {
    width: fullWidth,
    height: fullHeight / 3,
    padding: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  divider: {
    height: 1,
    width: fullWidth,
    backgroundColor: '#c7c7c7',
  },
});

const styles = { ...localStyles, ...globalStyles };

class CreatePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.createPreview = this.createPreview.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.post = this.post.bind(this);
    this.state = {
      postLink: null,
      postBody: null,
      postTags: null,
      postCategory: null,
      openCategory: false,
      type: 'url',
      stage: 1,
      urlPreview: null,
      tagStage: 1,
      postImage: null,
      catObj: null,
      visibleHeight: Dimensions.get('window').height - 60,
    };
  }

  componentDidMount() {
    const self = this;
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
    self.props.actions.getParentTags();
  }

  componentWillUnmount() {
    const self = this;
    self.props.actions.setPostCategory();
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    const newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60;
    this.setState({ visibleHeight: newSize });
  }

  keyboardWillHide(e) {
    this.setState({ visibleHeight: Dimensions.get('window').height - 60 });
  }

  switchType(type) {
    const self = this;
    self.props.actions.setView('post', type);
  }

  post() {
    const self = this;
    const link = self.state.postLink;
    const body = self.state.postBody;
    const title = self.state.postTitle;
    const category = self.props.posts.createPostCategory ? self.props.posts.createPostCategory._id : null;
    const view = self.props.view.post;
    let tags = [];
    if (!self.state.postLink && view === 'url') {
      AlertIOS.alert("Add URL");
      return;
    }

    if (view === 'url') {
      if (!self.validURL()) {
        AlertIOS.alert("not a valid url");
        return;
      }
    }

    if (view !== 'url' && !self.state.postTitle) {
      AlertIOS.alert("Add title");
      return;
    }

    if (!self.state.postBody) {
      AlertIOS.alert("Add body");
      return;
    }

    if (view === 'image' && !self.state.postImage) {
      AlertIOS.alert("Add an image");
      return;
    }

    if (link) {
      if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
        self.setState({postLink: 'http://'+link});
      }
    }

    if (!self.props.posts.createPostCategory) {
      AlertIOS.alert("Add category");
      return;
    }


    if (!self.state.postTags) {
      AlertIOS.alert("Add tags");
      return;
    }

    const bodyTags = self.state.postBody.match(/#\S+/g);
    const bodyMentions = self.state.postBody.match(/@\S+/g);
    const finalTags = [];
    const finalMentions = [];

    if (bodyTags) {
      bodyTags.forEach((tag) => {
        const newTag = tag.replace('#', '');
        finalTags.push(newTag);
      });
    }
    if (bodyMentions) {
      bodyMentions.forEach((name) => {
        const newName = name.replace('@', '');
        finalMentions.push(newName);
      });
    }

    const noSpaces = self.state.postTags.replace(/\s*,\s*/g, ',');
    const tagsArray = noSpaces.split(',');
    tags = finalTags.concat(tagsArray);

    if (view === 'url') {
      utils.post.generate(self.state.postLink, body, tags, self.props.auth.token).then((results) => {
        if (!results) {
          AlertIOS.alert("Post error please try again");
        } else {
          AlertIOS.alert("Posted");
          self.props.actions.setPostCategory(null);
          self.props.actions.clearPosts('user');
          self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
          self.props.navigator.resetTo({ name: 'discover' });
        }
      });
    }

    let postBody = null;

    if (view !== 'url') {
      if (view === 'text') {
        postBody = {
          link: null,
          body,
          tags,
          title,
          description: null,
          category,
          image: null,
          mentions: finalMentions,
        };
      }

      if (view === 'image') {
        postBody = {
          link: null,
          body,
          tags,
          title,
          category,
          description: null,
          image: self.state.postImage,
          mentions: finalMentions,
        };
      }

      self.props.actions.dispatchPost(postBody, self.props.auth.token).then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Posted');
          self.props.actions.setPostCategory(null);
          self.props.navigator.push({ key: 'discover', title: 'Discover', back: false });
          self.props.actions.clearPosts('user');
          self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
        }
      });
    }

    self.setState({ postImage: null, postTitle: null, postBody: null, postLink: null, stage: 1 });
  }

  isOdd(num) {
    return num % 2;
  }

  validURL() {
    const str = this.state.postLink;
    const pattern = new RegExp(/^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i);
    if (!pattern.test(str)) {
      console.log("not a valid url");
      return false;
    } else {
      return true;
    }
  }

  removeTag(tag) {
    const self = this;
    var index = self.state.postTags.indexOf(tag);
    self.state.postTags.splice(index, 1);
    self.setState({});
  }

  removeImage() {
    const self = this;
    self.setState({ postImage: null });
    console.log('remove image', self.state);
  }

  chooseImage() {
    const self = this;
    self.pickImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, self.props.auth.token).then((results) => {
          if (results.success) {
            self.setState({ postImage: results.url });
          } else {
            console.log('err');
          }
        });
      }
    });
  }

  pickImage(callback) {
    const self = this;
    console.log(self, 'pickImage');
    ImagePicker.showImagePicker(pickerOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        callback('cancelled');
      } else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        callback("error");
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        callback("error");
      } else {
        callback(null, response.uri);
      }
    });
  }

  createPreview() {
    const self = this;
    utils.post.generatePreview(self.state.postLink).then((results) => {
      if (results) {
        self.setState({
          urlPreview: {
            image: results.image ? results.image : 'https://s3.amazonaws.com/relevant-images/missing.png',
            title: results.title ? results.title : 'Untitled',
            description: results.description,
          },
        });
      } else {
        AlertIOS.alert("Error parsing URL");
      }
    });
  }

  goTo(view) {
    const self = this;
    self.props.navigator.push(view);
  }

  render() {
    const self = this;
    let typeEl = null;
    const view = self.props.view.post;

    typeEl = (<View style={[styles.row, styles.typeBar]}>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, view === 'url' ? styles.activeBorder : null]} onPress={() => self.switchType('url')}>
        <Text style={[styles.type, styles.darkGray, styles.font15, view === 'url' ? styles.active : null]}>Url</Text>
      </TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, view === 'text' ? styles.activeBorder : null]} onPress={() => self.switchType('text')}>
        <Text style={[styles.type, styles.darkGray, styles.font15, view === 'text' ? styles.active : null]}>Text</Text>
      </TouchableHighlight>
      <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, view === 'image' ? styles.activeBorder : null]} onPress={() => self.switchType('image')}>
        <Text style={[styles.type, styles.darkGray, styles.font15, view === 'image' ? styles.active : null]}>Image</Text>
      </TouchableHighlight>
    </View>);

    return (
      <View style={[{ height: self.state.visibleHeight, backgroundColor: 'white' }]}>
        <ScrollView keyboardShouldPersistTaps contentContainerStyle={{ flexDirection: 'column', height: fullHeight - 120 }}>
          {typeEl}
          {view === 'url' ? <View style={{ borderBottomColor: !self.state.urlPreview ? '#f0f0f0' : 'transparent', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1 }}><TextInput numberOfLines={1} style={[styles.font15, {flex: 1, padding: 10}]} placeholder={'Enter URL here...'} multiline={false} onChangeText={(postLink) => this.setState({ postLink, urlPreview: null })} onBlur={self.createPreview} onSubmitEditing={self.createPreview} value={this.state.postLink} returnKeyType={'done'} /></View> : null}

          {view === 'image' && !self.state.postImage ? <TouchableHighlight style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center', paddingLeft: 10}} underlayColor={'transparent'} onPress={self.chooseImage}><Text>Upload an image</Text></TouchableHighlight> : null}

          {view === 'image' && self.state.postImage ? <View style={{ flex: 0.1, borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingLeft: 10, alignItems: 'center' }}>
            <Image source={{ uri: self.state.postImage }} style={styles.previewImage} />
            <TouchableHighlight style={[]} onPress={self.removeImage}><Text>Remove image</Text></TouchableHighlight>
          </View> : null}

          {view !== 'url' ? <View style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center' }}><TextInput style={[styles.font15, { flex: 1, padding: 10 }]} placeholder={'Title here...'} multiline={false} onChangeText={(postTitle) => this.setState({ postTitle })} value={this.state.postTitle} returnKeyType={'done'} /></View> : null}

          {view === 'url' && self.state.urlPreview ? <View style={{ flex: 0.2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0', paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
            <View style={{ borderRadius: 4, borderColor: '#f0f0f0', borderStyle: 'solid', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', flex: 1, overflow: 'hidden' }}>
              {self.state.urlPreview.image ? <Image source={{ uri: self.state.urlPreview.image }} style={{ flex: 0.4, resizeMode: 'cover' }} /> : null }
              <Text style={{ flex: 0.6, padding: 5, color: '#808080' }}>{self.state.urlPreview.title}</Text>
            </View>
          </View> : null}

          <View style={{ borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth, flex: !self.state.urlPreview ? 0.6 : 0.4 }}><TextInput style={[styles.font15, { flex: 1, padding: 10 }]} placeholder={'Body here...'} multiline onChangeText={(postBody) => this.setState({ postBody })} value={this.state.postBody} returnKeyType={'done'} /></View>

          <TouchableHighlight style={{ paddingLeft: 10, borderBottomColor: '#f0f0f0', borderBottomWidth: StyleSheet.hairlineWidth, flex: 0.1, justifyContent: 'center' }} underlayColor={'transparent'} onPress={() => self.goTo({ key: 'categories', title: 'Categories', back: true })}><Text>{self.props.posts.createPostCategory ? self.props.posts.createPostCategory.emoji + ' ' + self.props.posts.createPostCategory.name :  'Choose Category'}</Text></TouchableHighlight>

          <View style={{ flex: 0.1, justifyContent: 'center' }}><TextInput style={[styles.font15, { flex: 1, padding: 10 }]} placeholder={'Enter tags... ex. webgl, slowstyle, xxx'} multiline={false} onChangeText={(postTags) => this.setState({ postTags })} value={this.state.postTags} returnKeyType={'done'} /></View>

          <TouchableHighlight underlayColor={'transparent'} style={{ backgroundColor: '#007aff', flex: 0.1, justifyContent: 'center' }} onPress={self.post}><Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text></TouchableHighlight>
        </ScrollView>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    view: state.view,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...postActions,
      ...viewActions,
      ...tagActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost);
