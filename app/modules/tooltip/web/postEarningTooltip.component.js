import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PostInfo from 'modules/post/postinfo.component';
import ULink from 'modules/navigation/ULink.component';

const EarningTooltip = props => {
  const { earning, posts, navigation, auth } = props;
  const postId = earning.post;
  const post = posts.posts[postId];
  if (!post) {
    return <div>No Post</div>;
  }
  let link;
  if (post && post.metaPost) {
    link = posts.links[post.metaPost];
  }
  return (
    <div>
      <ULink
        to={`/${earning.community}/post/${post.parentPost ? post.parentPost : post._id}`}
      >
        <PostInfo
          link={link}
          post={post}
          community={earning.community}
          noLink
          navigation={navigation}
          auth={auth}
        />
      </ULink>
    </div>
  );
};

EarningTooltip.propTypes = {
  earning: PropTypes.object,
  posts: PropTypes.object,
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

// const mapDispatchToProps = dispatch => ({
// });

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(EarningTooltip);
