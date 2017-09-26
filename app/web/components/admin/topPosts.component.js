import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as postActions from '../../../actions/post.actions';
import Post from '../post/post.component';

let styles;

if (process.env.BROWSER === true) {
  require('../post/post.css');
}

class TopPosts extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.actions.getTopPosts();
  }


  render() {
    let { topPosts } = this.props;


    let postsEl = topPosts.map(p => (
      <div key={p._id}>
        <Post
          {...this.props}
          post={p}
        />
        <button onClick={() => this.props.actions.sendPostNotification(p)} >Send 'Top Post' notification</button>
      </div>
      )
    );

    return (
      <div className={'postContainer'}>
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
  }),
  dispatch => ({
    actions: bindActionCreators(postActions, dispatch)
  })
)(TopPosts);
