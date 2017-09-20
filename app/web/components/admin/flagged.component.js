import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as postActions from '../../../actions/post.actions';
import Post from '../post/post.component';

let styles;

if (process.env.BROWSER === true) {
  require('../post/post.css');
}

class Flagged extends Component {
  constructor(props) {
    super(props);
    this.deletePost = this.deletePost.bind(this);
  }

  componentDidMount() {
    this.props.actions.getFlaggedPosts();
  }

  deletePost(post) {
    this.props.actions.deletePost(post);
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

    let deleteEl = (post) => {
      if (post.user._id === this.props.auth.user._id ||
        this.props.auth.user.role === 'admin') {
          return (
            <button
              style={{ margin: 'auto' }}
              onClick={() => this.deletePost(post)}
            >
              Delete
            </button>
        );
      }
    };

    let postsEl = flaggedPosts.map(p => (
      <div>
        <Post
          key={p._id}
          {...this.props}
          flagged={p.flagged}
          post={p}
        />
        {deleteEl(p)}
      </div>)
    );

    return (
      <div className={'postContainer'}>
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
