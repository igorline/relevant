import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  AlertIOS,
  Easing,
  InteractionManager
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as NavigationExperimental from 'react-navigation';
import * as authActions from '../../actions/auth.actions';
import * as createPostActions from '../../actions/createPost.actions';
import * as postActions from '../../actions/post.actions';
import * as tagActions from '../../actions/tag.actions';
import * as userActions from '../../actions/user.actions';
import * as navigationActions from '../../actions/navigation.actions';
import UrlComponent from './url.component';
import Categories from './categories.component';
import * as utils from '../../utils';
import Card from '../nav/card.component';
import CustomSpinner from '../CustomSpinner.component';

import { globalStyles } from '../../styles/global';

const {
  Transitioner: NavigationTransitioner,
} = NavigationExperimental;

const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;

let styles;

class CreatePostContainer extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      creatingPost: false
    };

    this.renderScene = this.renderScene.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.back = this.back.bind(this);
    this.next = this.next.bind(this);
    this.uploadPost = this.uploadPost.bind(this);
    this.createPost = this.createPost.bind(this);
    this.configureTransition = this.configureTransition.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.tags.length) this.props.actions.getParentTags();
    });
  }

  componentWillReceiveProps(next) {
    if (next.navProps.scene.isActive === false) {
      if (this.urlComponent) this.urlComponent.input.blur();
    }
    if (this.props.createPost.edit && this.props.createPost.postUrl !== next.createPost.postUrl) {
      this.newUrl = true;
    }
  }

  back() {
    if (this.urlComponent) this.urlComponent.input.blur();

    let scene = 'home';
    if (this.props.navigation.index > 0) scene = 'createPost';

    if (this.props.navigation.index === 0) {
      if (this.props.close) this.props.close();
      // if (this.props.createPost.repost || this.props.createPost.edit) {
      this.props.actions.clearCreatePost();
      // }
    }
    this.props.actions.pop(scene);
  }

  next() {
    if (!this.skipUrl && this.props.createPost.postUrl && !this.props.createPost.urlPreview) {
      AlertIOS.alert(
        'Url is still loading, please give it a few more seconds',
        null,
        [
          { text: 'Continue Anyway',
            onPress: () => {
              this.skipUrl = true;
              return this.next(true);
            }
          },
          { text: 'Wait', onPress: () => null },
        ]
      );
      return null;
    }
    this.skipUrl = false;

    this.urlComponent.input.blur();

    if (this.props.createPost.repost) return this.createRepost();
    if (this.props.createPost.edit && !this.newUrl) {
      return this.editPost();
    }

    if (this.props.navigation.index === 0 && this.enableNext) {
      this.props.navigator.push({
        key: 'categories',
        back: true,
        title: 'Post Category',
      }, 'createPost');
    }
    return null;
  }

  editPost() {
    let props = this.props.createPost;
    let postBody = {
      ...props.editPost,
      tags: [...new Set(props.allTags.map(tag => tag._id))],
      body: props.postBody,
      mentions: props.bodyMentions,
      // link: props.postUrl,
      // title: props.urlPreview ? props.urlPreview.title.trim() : null,
      // description: props.urlPreview ? props.urlPreview.description : null,
      // category: props.postCategory,
      // image: this.image,
      // domain: props.domain,
      // keywords: props.keywords,
      // articleAuthor: props.articleAuthor,
      // shortText: props.shortText,
    };
    this.props.actions.editPost(postBody, this.props.auth.token)
      .then((results) => {
        if (results.success) {
          AlertIOS.alert('Post error please try again');
        } else {
          AlertIOS.alert('Success!');
          this.props.actions.clearCreatePost();
          this.props.navigator.resetRoutes('home');
          this.props.actions.setUserSearch([]);
        }
      });
  }

  createRepost() {
    if (this.state.creatingPost) return;

    let props = this.props.createPost;

    let commentObj = {
      post: props.repost._id,
      text: props.postBody,
      repost: true
    };

    this.setState({ creatingPost: true });
    this.props.actions.createComment(this.props.auth.token, commentObj)
    .then(() => {
      console.log('created comment?');
      this.props.actions.clearCreatePost();
      this.props.navigator.resetRoutes('home');
      this.props.actions.resetRoutes('discover');
      this.props.navigator.changeTab('discover');
      this.props.navigator.reloadTab('discover');
      this.props.navigator.setView('discover', 1);
      this.props.actions.setUserSearch([]);
      if (this.props.close) this.props.close();
      this.setState({ creatingPost: false });
    });
  }

  createPost() {
    // console.log(this.props.createPost.allTags.map(tag => tag._id));
    // return;

    if (this.state.creatingPost) return;

    let props = this.props.createPost;
    this.image = null;

    if (!props.postCategory) {
      AlertIOS.alert('Please add category');
      return;
    }

    this.setState({ creatingPost: true });
    if (props.urlPreview && props.urlPreview.image && !props.nativeImage) {
      utils.s3.toS3Advanced(props.urlPreview.image)
      .then((results) => {
        if (results.success) {
          this.image = results.url;
          this.uploadPost();
        } else {
          AlertIOS.alert('Error uploading image, please try again');
          this.setState({ creatingPost: false });
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
      tags: [...new Set(props.allTags.map(tag => tag._id))],
      body: props.postBody,
      title: props.urlPreview ? props.urlPreview.title.trim() : null,
      description: props.urlPreview ? props.urlPreview.description : null,
      category: props.postCategory,
      image: this.image,
      mentions: props.bodyMentions,
      investments: [],
      domain: props.domain,
      keywords: props.keywords,
      articleAuthor: props.articleAuthor,
      shortText: props.shortText,
    };

    if (props.edit) {
      postBody = { ...props.editPost, ...postBody };
      return this.props.actions.editPost(postBody, this.props.auth.token)
        .then((results) => {
          if (results.success) {
            AlertIOS.alert('Post error please try again');
          } else {
            AlertIOS.alert('Success!');
            this.props.actions.clearCreatePost();
            this.props.actions.resetRoutes('createPost');
            this.props.navigator.resetRoutes('home');
          }
        });
    }

    this.props.actions.submitPost(postBody, this.props.auth.token)
      .then((results) => {
        if (!results) {
          AlertIOS.alert('Post error please try again');
          this.setState({ creatingPost: false });
        } else {
          if (this.props.close) this.props.close();
          this.props.actions.clearCreatePost();
          this.props.navigator.resetRoutes('home');
          this.props.actions.resetRoutes('discover');
          this.props.actions.resetRoutes('createPost');
          this.props.navigator.changeTab('discover');
          this.props.navigator.reloadTab('discover');
          this.props.navigator.setView('discover', 1);
        }
      });
  }

  renderRight(props) {
    this.enableNext = false;
    if (this.props.createPost.postBody && this.props.createPost.postBody.length) {
      this.enableNext = true;
    }
    if (this.props.createPost.postUrl && this.props.createPost.urlPreview) {
      this.enableNext = true;
    }
    if (this.props.createPost.postUrl && !this.props.createPost.urlPreview) {
      this.enableNext = true;
    }
    if (this.state.creatingPost) this.enabledNext = false;

    let rightText = props.scene.route.next || 'Next';
    let enabled = this.enableNext;
    let rightAction = p => this.next(p);
    if (this.current !== 'url') {
      rightText = 'Post';
      enabled = this.props.createPost.postCategory && !this.state.creatingPost;
      rightAction = () => {
        // if (this.props.createPost.edit) return this.editPost();
        return this.createPost();
      };
    }

    return (
      <TouchableHighlight
        style={[styles.rightButton, { opacity: enabled ? 1 : 0.3 }]}
        underlayColor={'transparent'}
        onPress={() => rightAction(props)}
      >
        <Text
          style={[
            styles.active,
            styles.rightButtonText,
          ]}
        >
          {rightText}
        </Text>
      </TouchableHighlight>
    );
  }

  renderScene(props) {
    let component = props.scene.route.component;

    if (this.state.creatingPost) return <CustomSpinner />;

    switch (component) {
      case 'createPost':
        this.current = 'url';
        return (<UrlComponent
          ref={(c) => { this.urlComponent = c; }}
          share={this.props.share}
          users={this.props.user}
          user={this.props.auth.user}
          {...this.props.createPost}
          actions={this.props.actions}
        />);
      case 'categories':
        this.current = 'categories';
        return <Categories done={this.createPost} {...this.props} />;
      default:
        return null;
    }
  }

  configureTransition() {
    // const easing = Easing.out(Easing.ease);
    const easing = Easing.bezier(0.0, 0, 0.58, 1);

    return {
      duration: 220,
      easing,
      useNativeDriver: !!NativeAnimatedModule ? true : false
    };
  }

  render() {
    let scene = this.props.navigation;

    return (<NavigationTransitioner
      style={{ backgroundColor: 'white' }}
      navigation={{ state: scene }}
      configureTransition={utils.transitionConfig}
      render={transitionProps => (
        <Card
          style={{ backgroundColor: 'white' }}
          renderScene={this.renderScene}
          back={this.back}
          scroll={this.props.navigation.scroll}
          next={this.next}
          renderRight={this.renderRight}
          share={this.props.share}
          header
          {...transitionProps}
        />)}
    />);
  }
}

const localStyles = StyleSheet.create({
  rightButton: {
    flex: 1,
    marginRight: 15,
    paddingVertical: 10,
  },
  rightButtonText: {
    textAlign: 'right',
    fontSize: 17,
    fontFamily: 'Helvetica'
  }
});


styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    navigation: state.navigation.createPost,
    home: state.navigation.home,
    createPost: state.createPost,
    user: state.user,
    tags: state.tags.parentTags,
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
