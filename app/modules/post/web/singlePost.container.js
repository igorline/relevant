import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as postActions from 'modules/post/post.actions';
import * as investActions from 'modules/post/invest.actions';
import { getComments } from 'modules/comment/comment.actions';
import Comments from 'modules/comment/web/comment.container';
import get from 'lodash/get';
import { View } from 'modules/styled/uni';
import { MAX_POST_WIDTH } from 'styles/layout';
import PostComponent from './post.component';

class SinglePostContainer extends Component {
  static propTypes = {
    actions: PropTypes.object,
    posts: PropTypes.object,
    match: PropTypes.object,
    location: PropTypes.object,
    comments: PropTypes.object,
    auth: PropTypes.object
  };

  static async fetchData(dispatch, params) {
    if (!params.id || params.id === undefined) return null;
    const fetchComments = dispatch(getComments(params.id));
    const fetchPost = dispatch(postActions.getSelectedPost(params.id));
    return Promise.all([fetchComments, fetchPost]);
  }

  componentDidMount() {
    this.getPost();
  }

  getPost = () => {
    const { actions, match, posts } = this.props;
    const { params } = match;
    const post = posts.posts[params.id];
    if (!post) actions.getSelectedPost(params.id);
    // TODO - we don't actually need to do this all the time...
    // but we do want to grab updated comments...
    actions.getComments(params.id);
  };

  componentDidUpdate(prevProps) {
    // TODO this is not needed if we don't wipe post reducer
    // when switching communities
    if (prevProps.auth.community !== this.props.auth.community) this.getPost();
  }

  render() {
    const { params } = this.props.match;
    const { posts, comments } = this.props;
    const post = posts.posts[params.id];
    if (!post) return null;
    const hasPost = post && post !== 'notFound';

    const firstPostId = get(comments.childComments, `${post._id}.0`);
    const firstPost = posts.posts[firstPostId];
    const link = posts.links[post.metaPost];

    return (
      <View maxWidth={MAX_POST_WIDTH} mb={20}>
        {hasPost && (
          <View>
            <PostComponent
              noComments
              link={link}
              post={post}
              firstPost={firstPost}
              {...this.props}
              hideDivider
              singlePost
            />
            <Comments post={post} {...this.props} />
          </View>
        )}
      </View>
    );
  }
}

export default connect(
  state => ({
    comments: state.comments,
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    investments: state.investments,
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...postActions,
        ...investActions,
        getComments
      },
      dispatch
    )
  })
)(SinglePostContainer);
