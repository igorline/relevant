import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import PostButtons from './postButtons.component.js';
import PostBody from './postBody.component.js';
import PostInfo from './postInfo.component.js';
import PostImage from './postImage.component.js';

class Post extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    let post = null;
    let body = null;
    let comments = null;
    let styles = { ...localStyles, ...globalStyles };

    if (this.props.post) {
      post = this.props.post;
      if (post.body) body = post.body;
      if (post.comments) comments = post.comments;
    }

    if (!this.props.auth.user) return null;

    return (
      <View style={[styles.postContainer]}>

        <PostInfo navigator={this.props.navigator} post={post} body={body} />

        <PostBody body={body} post={post} editing={false} />

        <PostButtons {...this.props} comments={comments} />

        <PostImage {...this.props} post={post} />

      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  postContainer: {
    paddingBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },

});
