import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component';
import Comment from './comment.component';

let styles;

class Post extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  renderCommentary() {
    let posts = Array.isArray(this.props.post) ? this.props.post : [this.props.post];
    let length = posts.length > 1;
    posts = posts.filter(postId => typeof postId === 'string');
    return posts.map((postId) => {
      let post = this.props.posts.posts[postId];
      let comment;
      if (typeof post.comments[0] === 'object') {
        comment = (
          <View style={[styles.comment, styles.boxShadow]}>
            <Comment {...this.props} comment={post.comments[0]} />
          </View>
        );
      }
      return (
        <View
          key={post._id}
          style={{ width: length ? fullWidth * 0.92 : fullWidth }}
        >
          <View
            style={[
              styles.commentary,
              length > 0 ? styles.boxShadow : null,
            ]}
          >
            <PostInfo navigator={this.props.navigator} post={post} />
            <PostBody post={post} editing={false} />
            <PostButtons {...this.props} post={post} comments={post.comments || null} />
          </View>
          {comment}
        </View>
      );
    });
  }

  render() {
    let post;
    let posts;

    if (!this.props.auth.user) return null;

    if (this.props.post) {
      posts = Array.isArray(this.props.post) ? this.props.post : [this.props.post];
      posts = posts.filter(p => typeof p === 'string');
      if (!posts.length) return null;
      post = this.props.posts.posts[posts[0]];
      if (!post) return null;
    }

    return (
      <View style={[styles.postContainer]}>

        <ScrollView
          horizontal
          scrollEnabled={posts.length > 1}
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.postScroll}
          snapToInterval={(fullWidth * 0.92) + 8}
          snapToAlignment={'center'}
          onScrollAnimationEnd={this.updateCurrent}
        >
          {this.renderCommentary()}
        </ScrollView>

        <PostImage post={post} />

      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  comment: {
    marginLeft: 25,
    marginRight: 4,
    marginBottom: 10,
  },
  commentary: {
    // height: 200,
    marginRight: 4,
    marginLeft: 4,
    marginTop: 3,
    marginBottom: 10
  },
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

styles = { ...localStyles, ...globalStyles };

