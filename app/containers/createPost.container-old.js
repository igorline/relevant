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
import RCTKeyboardToolbarTextInput from 'react-native-textinput-utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import * as viewActions from '../actions/view.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as navigationActions from '../actions/navigation.actions';
import Tabs from '../components/tabs.component';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import * as utils from '../utils';

// import urlComponent from '../compoents/createPost/url';
import UrlPreview from '../components/urlPreview.component';

const ImagePicker = require('react-native-image-picker');

let styles;

class CreatePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.createPreview = this.createPreview.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.post = this.post.bind(this);
    this.switchType = this.switchType.bind(this);
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
      keyboard: false,
      currentStep: 0
    };
    this.steps = [
      { key: 'url', el: 'urlInput' },
      { key: 'body', el: 'bodyInput' },
      { key: 'cat' },
      { key: 'tags', el: 'tagInput' },
    ];
    this.step = this.steps[this.state.currentStep];
  }

  componentDidMount() {
    this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
    this.props.actions.getParentTags();
  }

  componentWillReceiveProps(next) {
    if (this.props.posts.createPostCategory !== next.posts.createPostCategory) {
      if (next.posts.createPostCategory) {
        this.nextStep();
      } else {
        this.prevStep();
      }
    }
  }

  componentWillUnmount() {
    this.props.actions.setPostCategory();
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillShow(e) {
    this.setState({ keyboard: true });
  }

  keyboardWillHide() {
    this.setState({ keyboard: false });
  }

  switchType(type) {
    this.props.actions.setView('post', type);
  }

  prevStep() {
    this.changeStep(this.state.currentStep - 1);
  }

  nextStep() {
    this.changeStep(this.state.currentStep + 1);
  }

  changeStep(currentStep) {
    if (this.step.el) this[this.step.el].refs.input.blur();
    if (currentStep < 0) {
      return;
    }
    this.step = this.steps[currentStep];

    if (this.step.el) this[this.step.el].refs.input.focus();
    if (this.step.key === 'cat') {
      this.goTo({
        key: 'categories',
        title: 'Categories',
        back: true
      });
    }
    this.setState({ currentStep });
  }

  post() {
    const link = this.state.postLink;
    const body = this.state.postBody;
    const title = this.state.postTitle;
    const category = this.props.posts.createPostCategory ?
      this.props.posts.createPostCategory._id : null;
    const view = this.props.view.post;
    let tags = [];
    if (!this.state.postLink && view === 'url') {
      AlertIOS.alert('Add URL');
      return;
    }

    if (view === 'url') {
      if (!this.validURL()) {
        AlertIOS.alert('not a valid url');
        return;
      }
    }

    if (view !== 'url' && !this.state.postTitle) {
      AlertIOS.alert('Add title');
      return;
    }

    if (!this.state.postBody) {
      AlertIOS.alert('Add body');
      return;
    }

    if (view === 'image' && !this.state.postImage) {
      AlertIOS.alert('Add an image');
      return;
    }

    if (link) {
      if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
        this.setState({ postLink: 'http://' + link });
      }
    }

    if (!this.props.posts.createPostCategory) {
      AlertIOS.alert('Add category');
      return;
    }


    if (!this.state.postTags) {
      AlertIOS.alert('Add tags');
      return;
    }

    const bodyTags = this.state.postBody.match(/#\S+/g);
    const bodyMentions = this.state.postBody.match(/@\S+/g);
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

    const noSpaces = this.state.postTags.replace(/\s*,\s*/g, ',');
    const tagsArray = noSpaces.split(',');
    tags = finalTags.concat(tagsArray);

    if (view === 'url') {
      utils.post.generate(this.state.postLink, body, tags, this.props.auth.token)
      .then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Posted');
          self.props.actions.setPostCategory(null);
          self.props.actions.clearPosts('user');
          self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
          self.props.actions.changeTab(1);
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
          image: this.state.postImage,
          mentions: finalMentions,
        };
      }

      this.props.actions.dispatchPost(postBody, this.props.auth.token).then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Posted');
          self.props.actions.setPostCategory(null);
          self.props.actions.clearPosts('user');
          self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
          self.props.actions.changeTab(1);
        }
      });
    }

    this.setState({ postImage: null, postTitle: null, postBody: null, postLink: null, stage: 1 });
  }

  isOdd(num) {
    return num % 2;
  }

  validURL() {
    const str = this.state.postLink;
    const pattern = new RegExp(/^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i);
    if (!pattern.test(str)) {
      console.log('not a valid url');
      return false;
    } else {
      return true;
    }
  }

  removeTag(tag) {
    let index = this.state.postTags.indexOf(tag);
    this.state.postTags.splice(index, 1);
    this.setState({});
  }

  removeImage() {
    this.setState({ postImage: null });
    console.log('remove image', this.state);
  }

  chooseImage() {
    this.pickImage((err, data) => {
      if (data) {
        utils.s3.toS3Advanced(data, this.props.auth.token).then((results) => {
          if (results.success) {
            this.setState({ postImage: results.url });
          } else {
            console.log('err');
          }
        });
      }
    });
  }

  pickImage(callback) {
    ImagePicker.showImagePicker(pickerOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        callback('cancelled');
      } else if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        callback('error');
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        callback('error');
      } else {
        callback(null, response.uri);
      }
    });
  }

  createPreview() {
    const self = this;
    if (!self.state.postLink) return;
    if (!self.state.postLink.length) return;

    utils.post.generatePreview(self.state.postLink).then((results) => {
      if (results) {
        this.setState({
          urlPreview: {
            image: results.image ? results.image : 'https://s3.amazonaws.com/relevant-images/missing.png',
            title: results.title ? results.title : 'Untitled',
            description: results.description,
          },
        });
      } else {
        AlertIOS.alert('Error parsing URL');
      }
    });
  }

  goTo(view) {
    this.props.navigator.push(view);
  }

  render() {
    const view = this.props.view.post;

    let tabs = [
      { id: 'url', title: 'Url' },
      { id: 'text', title: 'Text' },
      { id: 'image', title: 'Image' }
    ];

    let typeEl = (
      <Tabs
        tabs={tabs}
        active={this.props.view.post}
        handleChange={this.switchType}
      />
    );

    let urlInput = (
      <View
        style={{
          borderBottomColor: !this.state.urlPreview ? '#f0f0f0' : 'transparent',
          borderBottomWidth: StyleSheet.hairlineWidth,
          flex: 0.1 }}
      >
        <RCTKeyboardToolbarTextInput
          ref={(c) => { this.urlInput = c; }}
          autoFocus
          leftButtonText="Cancel"
          rightButtonText="Next"
          onCancel={() => this.prevStep()}
          onDone={() => this.nextStep()}
          numberOfLines={1}
          style={[
            styles.font15,
            styles.postInput,
          ]}
          placeholder={'Enter URL here...'}
          multiline={false}
          onChangeText={postLink => this.setState({ postLink, urlPreview: null })}
          onBlur={this.createPreview}
          onSubmitEditing={this.createPreview}
          value={this.state.postLink}
          returnKeyType={'next'}
        />
      </View>
    );

    let postImage = (
      <TouchableHighlight
        style={[styles.greyBottomBorder, {
          flex: 0.1,
          justifyContent: 'center',
          paddingLeft: 10
        }]}
        underlayColor={'transparent'}
        onPress={this.chooseImage}
      >
        <Text>Upload an image</Text>
      </TouchableHighlight>
    );

    let imagePreview = (
      <View
        style={[styles.greyBottomBorder, {
          flex: 0.1,
          flexDirection: 'row',
          paddingLeft: 10,
          alignItems: 'center'
        }]}
      >
        <Image
          source={{ uri: this.state.postImage }}
          style={styles.previewImage}
        />
        <TouchableHighlight
          style={[]}
          onPress={this.removeImage}
        >
          <Text>Remove image</Text>
        </TouchableHighlight>
      </View>
    );

    let postTitle = (
      <View
        style={[styles.greyBottomBorder, {
          flex: 0.1,
          justifyContent: 'center'
        }]}
      >
        <RCTKeyboardToolbarTextInput
          leftButtonText="Previous"
          rightButtonText="Next"
          onCancel={() => this.prevStep()}
          onDone={() => this.nextStep()}
          style={[styles.font15, { flex: 1, padding: 10 }]}
          placeholder={'Title here...'}
          multiline={false}
          onChangeText={postTitle => this.setState({ postTitle })}
          value={this.state.postTitle}
          returnKeyType={'done'}
        />
      </View>
    );

    let postBody = (
      <View
        style={[styles.greyBottomBorder, {
          flex: !this.state.urlPreview ? 0.5 : 0.3 }
        ]}
      >
        <RCTKeyboardToolbarTextInput
          leftButtonText="Previous"
          rightButtonText="Next"
          ref={(c) => { this.bodyInput = c; }}
          onCancel={() => this.prevStep()}
          onDone={() => this.nextStep()}
          style={[
            styles.font15,
            { flex: 1, padding: 10 }]}
          placeholder={'Body here...'}
          multiline
          onChangeText={postBody => this.setState({ postBody })}
          value={this.state.postBody}
          returnKeyType={'default'}
        />
      </View>
    );

    let catButton = (
      <TouchableHighlight
        style={[styles.greyBottomBorder, {
          paddingLeft: 10,
          flex: 0.1,
          justifyContent: 'center'
        }]}
        underlayColor={'transparent'}
        onPress={() => this.goTo({ key: 'categories', title: 'Categories', back: true })}
      >
        <Text>
          {
            this.props.posts.createPostCategory ?
            `${this.props.posts.createPostCategory.emoji} ${this.props.posts.createPostCategory.name}` :
            'Choose Category'
          }
        </Text>
      </TouchableHighlight>
    );

    let tagsInput = (
      <View
        style={{ flex: 0.1, justifyContent: 'center' }}
      >
        <RCTKeyboardToolbarTextInput
          leftButtonText="Previous"
          rightButtonText="Post"
          ref={(c) => { this.tagInput = c; }}
          onCancel={() => this.prevStep()}
          onDone={() => this.post()}
          style={[styles.font15, { flex: 1, padding: 10 }]}
          placeholder={'Enter tags... ex. webgl, slowstyle, xxx'}
          multiline={false}
          onChangeText={postTags => this.setState({ postTags })}
          value={this.state.postTags}
          returnKeyType={'done'}
        />
      </View>
    );

    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps
        contentInset={{
          bottom: this.state.keyboard ? 220 : 0,
        }}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode={'on-drag'}
        contentContainerStyle={{
          flexDirection: 'column',
          backgroundColor: 'white',
          flex: 1,
        }}
      >
        {/*typeEl*/}
        {view === 'url' ? urlInput : null}

        {view === 'image' && !this.state.postImage ? postImage : null}
        {view === 'image' && this.state.postImage ? imagePreview : null}
        {view !== 'url' ? postTitle : null}

        {view === 'url' ?
          <UrlPreview urlPreview={this.state.urlPreview} /> : null
        }

        { postBody }
        { catButton }
        { tagsInput }

        <TouchableHighlight
          underlayColor={'transparent'}
          style={{ backgroundColor: '#007aff', flex: 0.1, justifyContent: 'center' }}
          onPress={this.post}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Submit
          </Text>
        </TouchableHighlight>
      </KeyboardAwareScrollView>
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
      ...navigationActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost);

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
    textAlign: 'left',
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

  greyBottomBorder: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...localStyles, ...globalStyles };
