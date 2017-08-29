import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import { globalStyles } from '../../styles/global';
import PostImage from './postImage.component';
import Commentary from './commentary.componentAndroid';

let styles;

class Post extends PureComponent {

  componentWillMount() {
  }

  shouldComponentUpdate(next) {
    // if (next.myPostInv !== this.props.myPostInv)
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
    let imageEl;
    // let separator = (
    //   <LinearGradient
    //     colors={[
    //       'hsla(240, 0%, 60%, 1)',
    //       'hsla(240, 20%, 96%, 1)',
    //       'hsla(240, 20%, 100%, 1)'
    //     ]} style={[styles.separator]}
    //   />);

    let separator = (
      <View
        style={[{ height: 30, backgroundColor: 'rgba(0,0,0,.03)' }]}
        // style={[{ height: 30, backgroundColor: 'hsl(238,20%,95%)'}]}
      />);
    let commentaryEl;
    let reposted;

    if (!this.props.auth.user) return null;

    let blocked = <View style={{ height: StyleSheet.hairlineWidth }} />;
    post = this.props.metaPost || this.props.post;

    if (!post || !post._id) {
      return blocked;
    }

    // if we have a repost, don't render the original post
    let commentary = this.props.commentary || [this.props.post];
    commentary = commentary.filter(p => p && p._id !== reposted);

    if (commentary.length) {
      commentaryEl = <Commentary {...this.props} commentary={commentary} />;
    }

    if (post.repost) {
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      post = { ...repost };
    }

    if (post.link || post.url || post.image) {
      imageEl = (<PostImage
        singlePost={this.props.singlePost}
        actions={this.props.actions}
        post={post}
      />);
    }

    return (
      <View style={{ overflow: 'hidden' }}>
        <View style={[styles.postContainer]}>
          {imageEl}
          {commentaryEl}
        </View>
        {!this.props.singlePost ? separator : null}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  postContainer: {
    paddingBottom: 20,
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
    myPostInv: state.investments.myPostInv,
    users: state.user.users
  };
}

export default connect(mapStateToProps, {})(Post);
