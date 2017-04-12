import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as postActions from '../../../actions/post.actions';
import Post from '../post/post';

let styles;

class Flagged extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.actions.getFlaggedPosts();
  }


  render() {
    let { flagged, metaPosts, posts } = this.props;
    let flaggedPosts = [];
    flagged.forEach(m => {
      let meta = metaPosts[m];
      if (!meta) return;
      meta.commentary.forEach(p => flaggedPosts.push(p));
    });
    flaggedPosts = flaggedPosts.map(p => posts[p]);
    flaggedPosts = flaggedPosts.filter(p => p);

    let postsEl = flaggedPosts.map(p => (
      <Post
        key={p._id}
        {...this.props}
        flagged={p.flagged}
        post={p}
      />)
    );

    return (
      <div style={{}}>
        <h2>Flagged Posts</h2>
        {postsEl}
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    flagged: state.posts.flagged,
    metaPosts: state.posts.metaPosts.flagged,
    posts: state.posts.posts,
    all: state.posts
  }),
  dispatch => ({
    actions: bindActionCreators(postActions, dispatch)
  })
)(Flagged);

