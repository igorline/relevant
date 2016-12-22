import React, { Component } from 'react';
import {
  StyleSheet,
  NavigationExperimental,
  View,
  Text,
  TouchableHighlight,
  AlertIOS
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BackButton from 'NavigationHeaderBackButton';
import * as authActions from '../actions/auth.actions';
import * as createPostActions from '../actions/createPost.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as navigationActions from '../actions/navigation.actions';
import UrlComponent from '../components/createPost/url.component';
import CreatePostComponent from '../components/createPost/createPost.component';
import Categories from '../components/createPost/categories.component';
import * as utils from '../utils';

import { globalStyles } from '../styles/global';

const {
  Header: NavigationHeader,
} = NavigationExperimental;


let styles;

class CreatePostContainer extends Component {

  constructor(props, context) {
    super(props, context);

    this.renderScene = this.renderScene.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.back = this.back.bind(this);
    this.uploadPost = this.uploadPost.bind(this);
    this.createPost = this.createPost.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
  }

  back() {
    this.props.actions.pop('home');
    if (this.props.step === 'url') {
      if (this.props.createPost.repost || this.props.createPost.edit) {
        this.props.actions.clearCreatePost();
      }
    }
  }

  next() {

    if (this.props.createPost.repost) return this.createRepost();
    if (this.props.createPost.edit) return this.editPost();

    if (this.props.step === 'url' && this.enableNext) {
      this.props.navigator.push({
        key: 'categories',
        back: true,
        title: 'Post Category',
      }, 'home');
    }

    if (this.props.step === 'post') {
      this.createPost();
    }
  }

  editPost() {
    let props = this.props.createPost;
    let postBody = {
      ...props.editPost,
      tags: props.bodyTags,
      body: props.postBody,
      mentions: props.bodyMentions,
    };
    this.props.actions.editPost(postBody, this.props.auth.token)
      .then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Success!');
          this.props.actions.clearCreatePost();
          this.props.navigator.resetRoutes('home');
          this.props.navigator.changeTab('discover');
          this.props.navigator.reloadTab('discover');
        }
      });
  }

  createRepost() {
    let props = this.props.createPost;
    if (!props.postBody) {
      return AlertIOS.alert('Please enter some text');
    }
    let commentObj = {
      post: props.repost,
      text: props.postBody,
      repost: true
    };
    this.props.actions.createComment(this.props.auth.token, commentObj)
    .then(() => {
      this.props.actions.clearCreatePost();
      this.props.navigator.resetRoutes('home');
      this.props.navigator.changeTab('discover');
      this.props.navigator.reloadTab('discover');
    });
  }

  createPost() {
    let props = this.props.createPost;
    this.image = null;
    let postBody = props.postBody;

    if (!postBody) {
      // TODO is this ok?
      if (props.urlPreview) {
        postBody = props.urlPreview.description;
        this.props.actions.setCreaPostState({ postBody });
      } else {
        AlertIOS.alert('Post has no body');
        return;
      }
    }

    if (!props.postCategory) {
      AlertIOS.alert('Please add category');
      return;
    }

    if (props.urlPreview && props.urlPreview.image && !props.nativeImage) {
      utils.s3.toS3Advanced(props.urlPreview.image)
      .then((results) => {
        if (results.success) {
          this.image = results.url;
          this.uploadPost();
        } else {
          console.log(results);
          // this.image = props.urlPreview ? props.urlPreview.image : null;
          // this.uploadPost();
        }
      });
    } else {
      this.image = props.urlPreview && props.urlPreview.image ?
        props.urlPreview.image :
        props.postImage;
      this.uploadPost();
    }
  }

  uploadPost() {
    let props = this.props.createPost;
    let postBody = {
      link: props.postUrl,
      tags: props.bodyTags,
      body: props.postBody,
      title: props.urlPreview ? props.urlPreview.title : null,
      description: props.urlPreview ? props.urlPreview.description : null,
      category: props.postCategory,
      image: this.image,
      mentions: props.bodyMentions,
      investments: [],
      domain: props.domain
    };
    this.props.actions.submitPost(postBody, this.props.auth.token)
      .then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Success!');
          this.props.actions.clearCreatePost();
          this.props.navigator.resetRoutes('home');
          this.props.navigator.changeTab('discover');
          this.props.navigator.reloadTab('discover');
        }
      });
  }

  renderRight(props) {
    this.enableNext = false;
    if (this.props.createPost.postBody && this.props.createPost.postBody.length) {
      this.enableNext = true;
    }
    let right = null;
    if (this.current === 'url') {
      right = (
        <TouchableHighlight
          style={[styles.rightButton, { opacity: this.enableNext ? 1 : 0.3 }]}
          underlayColor={'transparent'}
          onPress={() => this.next(props)}
        >
          <Text
            style={[
              styles.rightButtonText,
            ]}
          >
            {/* props.scene.route.next */}
            Next
          </Text>
        </TouchableHighlight>
      );
    } else if (this.current === 'categories') {
      right = (
        <TouchableHighlight
          style={[styles.rightButton, { opacity: this.props.createPost.postCategory ? 1 : 0.3 }]}
          underlayColor={'transparent'}
          onPress={() => this.createPost(props)}
        >
          <Text
            style={[
              styles.rightButtonText,
            ]}
          >
            Post
          </Text>
        </TouchableHighlight>
      );
    }
    return right;
  }

  renderLeft(props) {
    let cancel = (
      <BackButton onPress={this.back} />
    );
    if (props.scene.route.back === 'Cancel') {
      cancel = (
        <TouchableHighlight
          style={[styles.rightButton]}
          underlayColor={'transparent'}
          onPress={() => this.props.close()}
        >
          <Text
            style={[
              styles.leftButtonText
            ]}
          >
            Cancel
          </Text>
        </TouchableHighlight>
      );
    }
    return cancel;
  }

  renderTitle(props) {
    let title = props.scene.route.title;
    return (
      <NavigationHeader.Title style={{ backgroundColor: 'transparent' }}>
        <Text >
          {title}
        </Text>
      </NavigationHeader.Title>
    );
  }

  renderHeader(props) {
    let header = (
      <NavigationHeader
        {...props}
        style={[
          this.props.share ? styles.shareHeader : null,
          {
            backgroundColor: 'white',
            borderBottomColor: '#f0f0f0',
            borderBottomWidth: 1
          }
        ]}
        renderTitleComponent={this.renderTitle}
        onNavigateBack={this.back}
        renderRightComponent={this.renderRight}
        renderLeftComponent={this.renderLeft}
      />
    );
    return header;
  }

  renderScene() {
    switch (this.props.step) {
      case 'url':
        this.current = 'url';
        return (<UrlComponent
          share={this.props.share}
          users={this.props.user}
          user={this.props.auth.user}
          {...this.props.createPost}
          actions={this.props.actions}
        />);
      case 'categories':
        this.current = 'categories';
        return <Categories done={this.createPost} {...this.props.createPost} actions={this.props.actions} />;
      case 'post':
        this.current = 'post';
        return <CreatePostComponent {...this.props.createPost} actions={this.props.actions} />;
      default:
        return null;
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderHeader(this.props.navProps)}
        {this.renderScene()}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  rightButton: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    width: 90,
  },
  rightButtonText: {
    color: 'rgb(0, 122, 255)',
    textAlign: 'right',
    fontSize: 17,
  },
  leftButtonText: {
    color: 'rgb(0, 122, 255)',
    textAlign: 'left',
    fontSize: 17,
  }
});


styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    navigation: state.navigation,
    createPost: state.createPost,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions,
        ...createPostActions,
        ...postActions,
        ...tagActions,
        ...userActions,
      },
      dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePostContainer);

