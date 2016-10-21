'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Picker,
  Animated,
  PickerIOS,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as statsActions from '../actions/stats.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as animationActions from '../actions/animation.actions';
import Spinner from 'react-native-loading-spinner-overlay';

const localStyles = StyleSheet.create({
  singlePostContainer: {
    width: fullWidth,
    flex: 1,
  },
});

let styles = { ...localStyles, ...globalStyles };

class SinglePost extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      postId: null,
      postData: null
    };
  }

  componentDidMount() {
    const self = this;
    console.log(self);
    if (self.props.posts.selectedPostId) {
      self.setState({ postId: self.props.posts.selectedPostId });
      if (self.props.posts.currentPostId === self.props.posts.selectedPostId) {
        if (self.props.posts.selectedPostData) {
          self.setState({ postData: self.props.posts.selectedPostData });
        }
      } else {
        self.props.actions.getSelectedPost(self.props.posts.selectedPostId);
      }
    }
  }

  componentWillReceiveProps(next) {
    const self = this;

    if (next.posts.selectedPostId !== self.props.posts.selectedPostId) {
      self.setState({ postId: null, postData: null });
      self.props.actions.clearSelectedPost();
    }

    if (next.posts.selectedPostId) {
      if (!self.state.postId) self.setState({ postId: next.posts.selectedPostId });
      if (next.posts.selectedPostId === next.posts.currentPostId) {
        if (next.posts.selectedPostData) {
          self.setState({ postData: next.posts.selectedPostData });
        }
      }
    }
  }

  componentWillUnment

  render() {
    const self = this;
    let post = null;
    let el = null;
    if (self.state.postData) {
      post = self.state.postData;
      el = (<ScrollView style={styles.fullContainer}>
          <View>
            <Post post={post} {...self.props} styles={styles} />
          </View>
      </ScrollView>);
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {el}
        <Spinner
          color="rgba(0,0,0,1)"
          overlayColor="rgba(0,0,0,0)"
          visible={!this.state.postData}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    stats: state.stats,
    users: state.user,
    investments: state.investments,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...statsActions,
      ...authActions,
      ...postActions,
      ...animationActions,
      ...investActions,
      ...userActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);
