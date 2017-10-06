import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';

import Post from '../post/post.component';

const postInitialAmt = 5; // # of posts to initially load on page
const postUpdateAmt = 5; // # of posts to load for each scroll

class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const section = this.props.section;
    const postIds = this.props.posts[section];
    const metaPosts = this.props.posts.metaPosts[section];

    const posts = postIds.map(id => {
      const metaPost = metaPosts[id];
      if (! metaPost) return
      const postId = section === 'new' ? metaPost.newCommentary : metaPost.topCommentary
      const post = this.props.posts.posts[postId]
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user,
      };
      console.log(metaPost, post)
      // console.log(post, repost, postUser)
      return (
        <Post key={id}
          metaPost={metaPost}
          post={post}
          repost={repost}
          postUser={postUser}
          {...this.props}
        />
      );
    });

    // if (!this.props.user) return null;
    return (
      <div className='parent'>
        <div className='postContainer'>
          {posts}
        </div>
      </div>
    );
  }

}

export default Posts;
