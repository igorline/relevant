import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles } from 'app/styles/global';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as animationActions from 'modules/animation/animation.actions';
import * as postActions from 'modules/post/post.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as investActions from 'modules/post/invest.actions';
import PostImage from './postImage.component';
import Commentary from './commentary.component';

let styles;

class Post extends PureComponent {
  static propTypes = {
    link: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    commentary: PropTypes.array,
    posts: PropTypes.object,
    singlePost: PropTypes.bool,
    actions: PropTypes.object
  };

  render() {
    const { link, commentary } = this.props;
    let { post } = this.props;
    let imageEl;

    const separator = (
      <View style={[{ height: 30, backgroundColor: 'rgba(0,0,0,.03)' }]} />
    );
    let commentaryEl;

    if (!this.props.auth.user) return null;

    const blocked = <View style={{ height: StyleSheet.hairlineWidth }} />;

    if (!post || !post._id) {
      return blocked;
    }

    // TODO... need to filter out reposted?
    // commentary = commentary.filter(p => p && p._id !== reposted);

    if (commentary && commentary.length) {
      commentaryEl = <Commentary {...this.props} commentary={commentary} />;
    } else {
      commentaryEl = <Commentary {...this.props} commentary={[post]} />;
    }

    if (post && post.repost) {
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      post = { ...repost };
    }

    if (link && (link.url || link.image)) {
      imageEl = (
        <PostImage
          key={link._id}
          singlePost={this.props.singlePost}
          actions={this.props.actions}
          post={link}
        />
      );
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
    paddingBottom: 20
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    myPostInv: state.investments.myPostInv,
    users: state.user.users
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...investActions,
        ...animationActions,
        ...tooltipActions,
        ...navigationActions,
        ...postActions,
        ...createPostActions
      },
      dispatch
    )
  };
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post);
