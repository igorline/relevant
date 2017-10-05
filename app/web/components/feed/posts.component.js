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
    console.log(this.props)
    return null

    const userId = this.props.params.id;
    const postIds = this.props.posts.userPosts[userId] || []

    const posts = postIds.map(id => {
      const post = this.props.posts.posts[id];
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user,
      };
      // console.log(post, repost, postUser)
      return (
        <Post key={id}
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
