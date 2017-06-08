import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import { globalStyles, fullHeight } from '../../styles/global';
import PostImage from './postImage.component';
import Commentary from './commentary.componentAndroid';
// import Excerpt from './excerpt.component';

let styles;

class Post extends PureComponent {

  componentWillMount() {
  }

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
    let imageEl;
    let separator = (
      <LinearGradient
        colors={[
          'hsla(240, 0%, 60%, 1)',
          'hsla(240, 20%, 96%, 1)',
          'hsla(240, 20%, 100%, 1)'
        ]} style={[styles.separator]}
      />);
    let commentaryEl;
    let reposted;

    if (!this.props.auth.user) return null;

    let blocked = <View style={{ height: StyleSheet.hairlineWidth }} />;

    if (this.props.post) {
      posts = Array.isArray(this.props.post) ? this.props.post : [this.props.post];
      posts = posts.filter(p => typeof p === 'string');
      posts = posts.map(p => this.props.posts.posts[p]);
      if (!posts.length) return blocked;
      posts = posts.filter(p => p);
      post = { ...posts[0] };
      if (post.repost) reposted = post.repost.post;
      if (!post) return blocked;
    }

    if (!post || !post._id) {
      return blocked;
    }

    // if we have a repost, don't render the original post
    let commentary = posts.filter(p => {
      return p._id !== reposted;
    });

    if (commentary.length) {
      commentaryEl = <Commentary {...this.props} commentary={commentary} />;
    }

    let repostEl = null;
    let postStyle = {};

    if (post.repost) {
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      if (repost.user && this.props.users[repost.user]) {
        repost.user = this.props.users[repost.user];
      }
      post.user = this.props.users[post.user] || post.user;
      post = { ...repost };
    }

    if (post.link || post.image) {
      imageEl = (<PostImage
        // metaPost={this.props.metaPost || post.metaPost}
        singlePost={this.props.singlePost}
        actions={this.props.actions}
        post={post}
      />);
    }
    post.user = this.props.users[post.user] || post.user;

    let article;
    // if (post.shortText && this.props.singlePost) {
    //   article = (
    //     <Excerpt
    //       post={post} actions={this.props.actions}
    //     />);
    // }

    // for testing rank
    // <Text>{this.props.metaPost ? this.props.metaPost.rank : null}</Text>

    return (
      <View style={{ overflow: 'hidden' }}>
        <View style={[styles.postContainer]}>
          <View style={styles.postInner}>
            {repostEl}
            <View style={postStyle}>
              {imageEl}
            </View>
          </View>
          {article}
          {commentaryEl}
        </View>
        {!this.props.singlePost ? separator : null}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  desc: {
    padding: 10,
    fontSize: 12,
  },
  excerpt: {
    padding: 10,
    marginTop: 10,
    fontFamily: 'Georgia',
    fontSize: 38 / 2,
    lineHeight: 55 / 2,
  },
  repost: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  cLabel: {
    fontSize: 14,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  postInner: {
  },
  postContainer: {
    paddingBottom: 20,
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


function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    myInvestments: state.investments.myInvestments,
    myEarnings: state.investments.myEarnings,
    users: state.user.users
  };
}

export default connect(mapStateToProps, {})(Post);
