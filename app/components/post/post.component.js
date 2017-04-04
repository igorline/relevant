import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import { globalStyles, fullHeight } from '../../styles/global';
import PostButtons from './postButtons.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostImage from './postImage.component1';
import Commentary from './commentary.component';
import Excerpt from './excerpt.component';
import LinearGradient from 'react-native-linear-gradient';

let styles;
const LAYOUT = 1;

class Post extends Component {

  componentWillMount() {
    // if (this.props.singlePost && this.props.post) {
    //   let post = this.props.posts.posts[this.props.post];
    //   this.props.actions.getPostHtml(post);
    // }
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
      posts = posts.filter(p => p);
      post = { ...posts[0] };
      if (post.repost) reposted = post.repost.post;
      if (!post) return null;
    }

    if (!post || !post._id) {
      return null;
    }

    let commentary = posts.filter(p => {
      if (LAYOUT === 1) return p._id !== reposted;
      return (p._id !== reposted && p._id !== post._id && !p.repost);
    });

    let label = null;
    if (commentary.length) {
      label = <Text style={[styles.tabFont, styles.cLabel]}>🤔 {LAYOUT !== 1 ? 'Other\'s ' : null}Commentary</Text>;
      commentaryEl = <Commentary {...this.props} commentary={commentary} />;
    }

    let repostEl = null;
    let postStyle = {};

    // if (this.props.showReposts && post && post.comments && post.comments[0]) {
    //   let repost = this.props.posts.comments[post.comments[0]];
    //   if (repost && repost.repost) {
    //     postStyle = [styles.repost, styles.boxShadow];
    //     let repostObj = {
    //       ...repost,
    //       user: this.props.users[repost.user] || repost.user,
    //       embeddedUser: repost.embeddedUser,
    //       body: repost.text,
    //       _id: post._id,
    //     };

    //     repostEl = (
    //       <View style={{ paddingBottom: 25 }}>
    //         <PostInfo repost {...this.props} post={repostObj} />
    //         <PostBody repost {...this.props} post={repostObj} />
    //       </View>
    //     );
    //   }
    // }

    if (post.repost) {
      // postStyle = [styles.repost, styles.boxShadow];
      let repost = this.props.posts.posts[post.repost.post];
      if (this.props.users[repost.user]) {
        repost.user = this.props.users[repost.user];
      }
      post.user = this.props.users[post.user] || post.user;

      // repostEl = (
      //   <View style={{ marginBottom: 25 }}>
      //     <PostInfo repost {...this.props} post={post} />
      //     <PostBody
      //       repost
      //       {...this.props}
      //       post={{ _id: repost._id, body: post.repost.commentBody }}
      //     />
      //   </View>
      // );
      post = { ...repost };
    }

    if (post.link || post.image) {
      // if (!this.props.metaPost) {
      //   if (typeof post.metaPost === 'string') {
      //     post.metaPost = this.props.posts.metaPosts[post.metaPost];
      //   }
      // }
      imageEl = (<PostImage
        // metaPost={this.props.metaPost || post.metaPost}
        singlePost={this.props.singlePost}
        actions={this.props.actions}
        post={post}
      />);
    }
    post.user = this.props.users[post.user] || post.user;

    let FBLayout = (
      <View>
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
    );

    // <TextBody
    //   maxTextLength={140}
    //   style={styles.excerpt}
    //   body={post.shortText || post.description }
    // />

    let article;
    // if (post.shortText && this.props.singlePost) {
    //   article = (
    //     <Excerpt
    //       post={post} actions={this.props.actions}
    //     />);
    // }

    return (
      <View style={{ overflow: 'hidden' }}>
        <View style={[styles.postContainer]}>
          <View style={styles.postInner}>
            {repostEl}
            <View style={postStyle}>
              {LAYOUT === 1 ? imageEl : FBLayout}
            </View>
          </View>
          {article}
          {LAYOUT !== 1 ? label : null}
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
    // borderWidth: StyleSheet.hairlineWidth,
  },
  cLabel: {
    fontSize: 14,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  postInner: LAYOUT === 1 ? {
    // paddingLeft: 10,
    // paddingRight: 10,
  } :
  {
    paddingLeft: 6,
    paddingRight: 160,
  },
  postContainer: LAYOUT === 1 ? {
    paddingBottom: 20,
    // paddingTop: 12,
    backgroundColor: 'white',
  } :
  {
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
  separator: {
    height: 16,
    borderColor: 'lightgrey',
    // borderBottomWidth: 1,

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    // backgroundColor: 'hsl(238,20%,15%)',
    // backgroundColor: 'hsl(238,20%,90%)',
    // backgroundColor: 'hsl(238,20%,25%)',
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
