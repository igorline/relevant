import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import * as postActions from '../../../actions/post.actions';

import Post from '../post/post.component';

if (process.env.BROWSER === true) {
  require('../post/post.css');
}

class TopPosts extends Component {
  static propTypes = {
    actions: PropTypes.object,
    topPosts: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getTopPosts();
  }

  render() {
    const { topPosts } = this.props;

    const postsEl = topPosts.map(p => (
      <div key={p._id}>
        <Post {...this.props} post={p} />
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
