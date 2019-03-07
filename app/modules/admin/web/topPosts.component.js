import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import * as postActions from 'modules/post/post.actions';
import PostComponent from 'modules/post/web/post.component';

class TopPosts extends Component {
  static propTypes = {
    actions: PropTypes.object,
    topPosts: PropTypes.array
  };

  componentDidMount() {
    this.props.actions.getTopPosts();
  }

  render() {
    const { topPosts } = this.props;

    const postsEl = topPosts.map(p => (
      <div key={p._id}>
        <PostComponent {...this.props} post={p} />
        <button onClick={() => this.props.actions.sendPostNotification(p)}>
          Send 'Top Post' notification
        </button>
      </div>
    ));

    return (
      <div className={'postContainer narrow'}>
        <h2>Top Posts</h2>
        {postsEl}
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    topPosts: state.posts.topPosts,
    user: state.user
  }),
  dispatch => ({
    actions: bindActionCreators({ ...adminActions, ...postActions }, dispatch)
  })
)(TopPosts);
