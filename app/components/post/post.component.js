import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { globalStyles, blue } from '../../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component';
import Commentary from './commentary.component';

let styles;

class Post extends Component {

  shouldComponentUpdate(next) {
    // console.log(next);
    // console.log('updating post');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ', pp);
    //     }
    //   }
    // }

    return true;
  }

  render() {
    let post;
    let posts;
    let imageEl = null;
    let separator = <View style={[styles.separator]} />;

    // let renderSeparator = () => {
    //   let color = `hsl(${Math.round(Math.random() * 256)}, 30%, 95%)`;
    //   return <View style={[styles.separator, { backgroundColor: color }]} />;
    // }

    if (!this.props.auth.user) return null;

    if (this.props.post) {
      posts = Array.isArray(this.props.post) ? this.props.post : [this.props.post];
      posts = posts.filter(p => typeof p === 'string');
      posts = posts.map(p => this.props.posts.posts[p]);
      if (!posts.length) return null;
      post = posts[0];
      if (!post) return null;
      if (post.link || post.image) imageEl = <PostImage post={post} />;
    }

    if (!post) return null;

    let label = null;
    let commentary = null;
    if (posts && posts.length > 1) {
      label = <Text style={[styles.tabFont, styles.cLabel]}>🤔 Other's Commentary</Text>;
      commentary = <Commentary {...this.props} commentary={posts.slice(1, posts.length)} />;
    }

    let repostEl = null;
    let postStyle = null;

    if (this.props.showReposts && post && post.comments && post.comments[0]) {
      let repost = this.props.posts.comments[post.comments[0]];
      if (repost && repost.repost) {
        // let repost = post.comments[0];
        postStyle = [styles.repost, styles.boxShadow];
        let repostObj = {
          ...repost,
          embeddedUser: repost.embeddedUser,
          body: repost.text,
          _id: post._id,
        };

        repostEl = (
          <View>
            <PostInfo repost {...this.props} post={repostObj} />
            <PostBody repost {...this.props} post={repostObj} />
          </View>
        );
      }
    }

    if (post.repost) {
      postStyle = [styles.repost, styles.boxShadow];
      let repost = this.props.posts.posts[post.repost.post];
      repostEl = (
        <View>
          <PostInfo repost {...this.props} post={post} />
          <PostBody
            repost
            {...this.props}
            post={{ _id: repost._id, body: post.repost.commentBody }}
          />
        </View>
      );
      post = repost;
    }

    return (
      <View style={{ overflow:'hidden' }}>
        <View style={[styles.postContainer]}>
          <View style={styles.postInner}>
            {repostEl}
            <View style={postStyle}>
              <PostInfo
                scene={this.props.scene}
                big
                {...this.props}
                post={post}
              />
              <PostBody
                scene={this.props.scene}
                {...this.props}
                post={post}
                editing={false}
              />
              {imageEl}
              <PostButtons
                scene={this.props.scene}
                {...this.props}
                post={post}
                comments={post.comments || null}
              />
            </View>
          </View>

          {label}
          {commentary}
        </View>
        {!this.props.singlePost ? separator : null}
      </View>
    );
  }
}

export default Post;

const localStyles = StyleSheet.create({
  repost: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    paddingBottom: 20,
    paddingTop: 10,
    // borderWidth: StyleSheet.hairlineWidth,
  },
  cLabel: {
    fontSize: 14,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  postInner: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  postContainer: {
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: 'white',
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

