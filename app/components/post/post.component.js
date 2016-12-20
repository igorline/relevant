import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component';
import Commentary from './commentary.component';

let styles;

class Post extends Component {

  render() {
    let post;
    let posts;
    let imageEl = null;

    if (!this.props.auth.user) return null;

    if (this.props.post) {
      posts = Array.isArray(this.props.post) ? this.props.post : [this.props.post];
      posts = posts.filter(p => typeof p === 'string');
      posts = posts.map(p => this.props.posts.posts[p]);
      if (!posts.length) return null;
      post = posts[0];
      if (!post) return null;
      if (post.image) imageEl = <PostImage post={post} />;
    }

    let label = null;
    let commentary = null;
    if (posts.length > 1) {
      label = <Text style={[styles.tabFont, styles.cLabel]}>🤔 Other's Commentary</Text>;
      commentary = <Commentary {...this.props} commentary={posts.slice(1, posts.length)} />;
    }

    let repostEl = null;
    let postStyle = null;

    if (post.comments && post.comments[0] && post.comments[0].repost) {
      let repost = post.comments[0];
      postStyle = [styles.repost, styles.boxShadow];
      let repostObj = {
        ...repost,
        embeddedUser: repost.embeddedUser,
        body: repost.text,
        _id: post._id,
      };

      repostEl = (
        <View>
          <PostInfo navigator={this.props.navigator} post={repostObj} />
          <PostBody repost {...this.props} post={repostObj} editing={false} />
        </View>
      );
    }

    return (
      <View style={[styles.postContainer]}>
        <View style={styles.postInner}>
          {imageEl}
          {repostEl}
          <View style={postStyle}>
            <PostInfo navigator={this.props.navigator} post={post} />
            <PostBody {...this.props} post={post} editing={false} />
            <PostButtons {...this.props} post={post} comments={post.comments || null} />
          </View>
        </View>

        {label}
        {commentary}

      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  repost: {
    paddingLeft: 10,
    paddingRight: 10,
    // borderWidth: StyleSheet.hairlineWidth,
  },
  cLabel: {
    fontSize: 14,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  comment: {
    marginLeft: 25,
    marginRight: 4,
    marginBottom: 10,
  },
  postInner: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  postContainer: {
    paddingBottom: 25,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#231f20',
    borderTopColor: '#231f20',
    marginBottom: 2,
    marginTop: 2,

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

styles = { ...localStyles, ...globalStyles };

