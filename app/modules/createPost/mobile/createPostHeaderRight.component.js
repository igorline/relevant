import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { analytics } from 'react-native-firebase';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as postActions from 'modules/post/post.actions';
import * as commentActions from 'modules/comment/comment.actions';
import * as userActions from 'modules/user/user.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as utils from 'app/utils';
import { globalStyles, mainPadding } from 'app/styles/global';

const Analytics = analytics();

let styles;

class CreatePostHeaderRight extends Component {
  static propTypes = {
    actions: PropTypes.object,
    createPost: PropTypes.object,
    navigation: PropTypes.object,
    screenProps: PropTypes.object,
    share: PropTypes.bool,
    editPost: PropTypes.object,
    postBody: PropTypes.object,
    repost: PropTypes.object,
    urlPreview: PropTypes.object,
    postUrl: PropTypes.object,
    edit: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      creatingPost: false
    };

    this.rightButtonAction = this.rightButtonAction.bind(this);
    this.uploadPost = this.uploadPost.bind(this);
    this.createPost = this.createPost.bind(this);
  }

  componentWillReceiveProps(next) {
    if (
      this.props.createPost.edit &&
      this.props.createPost.postUrl !== next.createPost.postUrl
    ) {
      this.newUrl = true;
    }
  }

  rightButtonAction(props) {
    if (
      !this.skipUrl &&
      this.props.createPost.postUrl &&
      !this.props.createPost.urlPreview
    ) {
      Alert.alert('Url is still loading, please give it a few more seconds', null, [
        {
          text: 'Continue Anyway',
          onPress: () => {
            this.skipUrl = true;
            return this.rightButtonAction(true);
          }
        },
        { text: 'Wait', onPress: () => null }
      ]);
      return null;
    }
    this.skipUrl = false;

    if (this.props.createPost.repost) return this.createRepost();
    if (this.props.createPost.edit && !this.newUrl) {
      return this.editPost();
    }

    if (this.enableNext) {
      props.navigation.navigate({
        routeName: 'createPostTags',
        params: {
          title: 'Post Category',
          next: 'Post'
        }
      });
    }
    return null;
  }

  editPost() {
    const props = this.props.createPost;
    const postBody = {
      ...props.editPost,
      tags: [...new Set(props.allTags.map(tag => tag._id))],
      body: props.postBody,
      mentions: props.bodyMentions
    };
    this.props.actions.editPost(postBody).then(res => {
      if (!res) return;
      Alert.alert('Success!');
      this.props.actions.clearCreatePost();
      this.props.navigation.navigate('main');
      this.props.actions.setUserSearch([]);
    });
  }

  createRepost() {
    if (this.state.creatingPost) return;

    const props = this.props.createPost;

    const commentObj = {
      post: props.repost._id,
      text: props.postBody,
      repost: true
    };

    this.setState({ creatingPost: true });
    this.props.actions.createComment(commentObj).then(() => {
      this.props.actions.clearCreatePost();
      this.props.actions.setUserSearch([]);
      this.setState({ creatingPost: false });

      if (this.props.screenProps.close) {
        return this.props.screenProps.close();
      }

      this.props.navigation.navigate('main');
      this.props.navigation.navigate('discover');
      this.props.navigation.popToTop();
      this.props.actions.reloadTab('discover');
      this.props.actions.setView('discover', 1);
      return null;
    });
  }

  createPost() {
    if (this.state.creatingPost) return;

    const props = this.props.createPost;
    this.image = null;

    if (!props.allTags.length) {
      Alert.alert('Please select at least one tag');
      return;
    }

    this.setState({ creatingPost: true });
    if (props.urlPreview && props.urlPreview.image && !props.nativeImage) {
      utils.s3
        .toS3Advanced(props.urlPreview.image)
        .then(results => {
          if (results.success) {
            this.image = results.url;
            this.uploadPost();
          } else {
            Alert.alert('Error uploading image, please try again');
            this.setState({ creatingPost: false });
          }
        })
        .catch(err => {
          Alert.alert('Error uploading image: ', err.message);
          this.setState({ creatingPost: false });
        });
    } else {
      this.image =
        props.urlPreview && props.urlPreview.image
          ? props.urlPreview.image
          : props.postImage;
      this.uploadPost();
    }
  }

  uploadPost() {
    const props = this.props.createPost;

    let postBody = {
      link: props.postUrl,
      tags: [...new Set([...props.allTags.map(tag => tag._id), ...props.bodyTags])],
      body: props.postBody,
      title: props.urlPreview ? props.urlPreview.title.trim() : null,
      description: props.urlPreview ? props.urlPreview.description : null,
      category: props.postCategory,
      image: this.image,
      mentions: props.bodyMentions,
      domain: props.domain,
      keywords: props.keywords,
      articleAuthor: props.articleAuthor,
      shortText: props.shortText
    };

    if (props.edit) {
      postBody = { ...props.editPost, ...postBody };
      return this.props.actions.editPost(postBody).then(res => {
        if (!res) return;
        Alert.alert('Success!');
        this.props.actions.clearCreatePost();
        this.props.navigation.navigate('main');
        this.props.actions.setUserSearch([]);
      });
    }

    this.props.actions.submitPost(postBody).then(results => {
      if (!results) {
        Alert.alert('Post error please try again');
        return this.setState({ creatingPost: false });
      }

      this.props.actions.setUserSearch([]);
      this.props.actions.clearCreatePost();
      Analytics.logEvent('newPost', {
        viaShare: this.props.share
      });

      if (this.props.screenProps.close) {
        return this.props.screenProps.close();
      }

      this.props.navigation.navigate('main');
      this.props.navigation.navigate('discover');
      this.props.navigation.popToTop();
      this.props.actions.reloadTab('discover');
      this.props.actions.setView('discover', 0);
      return null;
    });
    return null;
  }

  render() {
    const { state } = this.props.navigation;
    const { params } = state;
    const { postBody } = this.props.createPost;

    if (state.routeName === 'shareAuth') {
      return null;
    }

    this.enableNext = false;
    const hasBody = postBody && postBody.trim().length;
    if (hasBody) {
      this.enableNext = true;
    }

    if (this.state.creatingPost) this.enabledNext = false;

    const rightText = params && params.next ? params.next : 'Post';

    let enabled;
    let rightAction;

    if (state.routeName === 'createPostUrl') {
      enabled = this.enableNext;
      rightAction = p => this.rightButtonAction(p);
    } else {
      enabled = this.props.createPost.allTags.length && !this.state.creatingPost;
      rightAction = () => this.createPost();
    }

    return (
      <TouchableOpacity
        key={state.routeName}
        style={[styles.rightButton]}
        onPress={() => rightAction(this.props)}
      >
        <Text
          style={[{ opacity: enabled ? 1 : 0.6 }, styles.active, styles.rightButtonText]}
        >
          {rightText}
        </Text>
      </TouchableOpacity>
    );
  }
}

const localStyles = StyleSheet.create({
  rightButton: {
    flex: 1,
    marginRight: mainPadding - 10,
    paddingVertical: 10
  },
  rightButtonText: {
    textAlign: 'right',
    fontSize: 17,
    fontFamily: 'Helvetica',
    paddingRight: 10
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    createPost: state.createPost
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...commentActions,
        ...navigationActions,
        ...createPostActions,
        ...postActions,
        ...userActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePostHeaderRight);
