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
  const { posts, postId, community, actions, navigation, auth, screenSize } = props;
  const post = posts.posts[postId];
  if (!post) return null;

  const link = post && post.metaPost && posts.links[post.metaPost];
  const parentId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;

  return (
    <View>
      <ULink
        onPress={() => actions.goToPost({ _id: parentId, community })}
        to={`/${community}/post/${parentId}`}
      >
        <View>
          {screenSize ? (
            <PostInfoMobile
              preview
              link={link}
              post={post}
              community={community}
              noLink
              navigation={navigation}
              auth={auth}
            />
          ) : (
            <PostInfo
              preview
              link={link}
              post={post}
              community={community}
              noLink
              navigation={navigation}
              auth={auth}
            />
          )}
        </View>
      </ULink>
    </View>
  );
};

PostPreview.propTypes = {
  posts: PropTypes.object,
  screenSize: PropTypes.number,
  postId: PropTypes.string,
  community: PropTypes.string,
  actions: PropTypes.object,
  navigation: PropTypes.object,
  auth: PropTypes.object
};

function mapStateToProps(state) {
  return {
    posts: state.posts,
    navigation: state.navigation,
    auth: state.auth
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
