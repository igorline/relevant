import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PostInfo from 'modules/post/postinfo.component';
import ULink from 'modules/navigation/ULink.component';

const EarningTooltip = props => {
  const {
    earning
    // posts
  } = props;
  const { post } = earning;
  if (!post) {
    return <div>No Post</div>;
  }
  return (
    <div>
      <ULink to={`/${earning.community}/post/${post._id}`}>
        <PostInfo link={post.metaPost} post={post} community={earning.community} noLink />
      </ULink>
    </div>
  );
};

EarningTooltip.propTypes = {
  earning: PropTypes.object
  // posts: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    posts: state.posts
  };
}

// const mapDispatchToProps = dispatch => ({
// });

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(EarningTooltip);
