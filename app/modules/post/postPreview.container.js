import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PostInfo from 'modules/post/postinfo.component';
import PostInfoMobile from 'modules/post/postinfo.mobile.component';
import ULink from 'modules/navigation/ULink.component';
import { View } from 'modules/styled/uni';
import * as navigationActions from 'modules/navigation/navigation.actions';

const PostPreview = props => {
  const { posts, mobile, postId, community, actions } = props;
  const post = posts.posts[postId];
  if (!post) return null;

  const link = post && post.metaPost && posts.links[post.metaPost];
  const parentId = post.parentPost ? post.parentPost : post._id;

  return (
    <View>
      <ULink
        onPress={() => actions.goToPost({ _id: parentId, community })}
        to={`/${community}/post/${parentId}`}
      >
        <View>
          {mobile ? (
            <PostInfoMobile
              preview
              link={link}
              post={post}
              community={community}
              noLink
            />
          ) : (
            <PostInfo preview link={link} post={post} community={community} noLink />
          )}
        </View>
      </ULink>
    </View>
  );
};

PostPreview.propTypes = {
  posts: PropTypes.object,
  mobile: PropTypes.bool,
  postId: PropTypes.string,
  community: PropTypes.string,
  actions: PropTypes.object
};

function mapStateToProps(state) {
  return {
    posts: state.posts
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...navigationActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostPreview);
