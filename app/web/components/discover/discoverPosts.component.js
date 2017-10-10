import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';

import Post from '../post/post.component';

const postInitialAmt = 5; // # of posts to initially load on page
const postUpdateAmt = 5; // # of posts to load for each scroll

class DiscoverPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  renderFeed() {
    return this.props.posts.feed.map(id => {
      const post = this.props.posts.posts[id]
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user,
      };
      // console.log(metaPost, post)
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
  }
  renderDiscover(sort, tag) {
    const postIds = tag ? this.props.posts.topics[sort][tag] : this.props.posts[sort];
    const metaPosts = this.props.posts.metaPosts[sort];

    return (postIds || []).map(id => {
      const metaPost = metaPosts[id];
      if (! metaPost) return
      const postId = sort === 'new' ? metaPost.newCommentary : metaPost.topCommentary
      const post = this.props.posts.posts[postId]
      if (! post) return
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user,
      };
      // console.log(metaPost, post)
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
  }
  render() {
    const sort = this.props.sort;
    const tag = this.props.tag;
    let posts;
    if (sort === 'feed') {
      posts = this.renderFeed()
    }
    else {
      posts = this.renderDiscover(sort, tag)
    }

    // if (!this.props.user) return null;
    return (
      <div className='parent'>
        {posts}
      </div>
    );
  }

}

export default DiscoverPosts;
