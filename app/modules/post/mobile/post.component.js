import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as tooltipActions from 'modules/tooltip/tooltip.actions';
import * as animationActions from 'modules/animation/animation.actions';
import * as postActions from 'modules/post/post.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as investActions from 'modules/post/invest.actions';
import PostInfo from 'modules/post/postinfo.mobile.component';
import { getTitle } from 'app/utils/post';
import { routing } from 'app/utils';
import { View } from 'modules/styled/uni';
import Commentary from './commentary.component';

class Post extends PureComponent {
  static propTypes = {
    link: PropTypes.object,
    auth: PropTypes.object,
    post: PropTypes.object,
    commentary: PropTypes.array,
    posts: PropTypes.object,
    singlePost: PropTypes.bool,
    actions: PropTypes.object,
    navigation: PropTypes.object.isRequired, // eslint-disable-line
    myPostInv: PropTypes.object,
    hideDivider: PropTypes.bool,
    preview: PropTypes.bool,
    noLink: PropTypes.bool
  };

  render() {
    const {
      link,
      commentary,
      auth,
      actions,
      myPostInv,
      singlePost,
      hideDivider,
      preview,
      noLink
    } = this.props;

    const { community } = auth;
    let { post } = this.props;

    const separator = (
      <View style={[{ height: 30, backgroundColor: 'rgba(0,0,0,.03)' }]} />
    );

    if (!auth.user) return null;

    const blocked = <View style={{ height: StyleSheet.hairlineWidth }} />;

    if (!post || !post._id) {
      return blocked;
    }

    const isLinkPost = link && (link.url || link.image);

    const renderComment = (commentary && commentary.length) || (isLinkPost && post.body);
    // TODO... need to filter out reposted?
    // commentary = commentary.filter(p => p && p._id !== reposted);

    const commentaryEl = renderComment ? (
      <Commentary
        isReply={!isLinkPost}
        isLinkPost={isLinkPost}
        {...this.props}
        commentary={commentary || [post]}
      />
    ) : null;

    if (post && post.repost) {
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      post = { ...repost };
    }

    const title = getTitle({ post, link });
    const postUrl = routing.getPostUrl(community, post);

    const postEl = isLinkPost ? (
      <View m={preview ? '4 0 0 0' : 0}>
        <PostInfo
          key={link._id}
          auth={auth}
          actions={actions}
          post={post}
          link={link}
          title={title}
          postUrl={postUrl}
          myPostInv={myPostInv}
          singlePost={singlePost}
          preview={preview}
          noLink={noLink}
        />
      </View>
    ) : (
      <Commentary {...this.props} commentary={[post]} />
    );

    return (
      <View style={{ overflow: 'hidden' }}>
        <View>
          {postEl}
          {commentaryEl || (preview && isLinkPost ? <View mt={2} /> : null)}
        </View>
        {!singlePost && !hideDivider ? separator : null}
      </View>
    );
  }
}

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
