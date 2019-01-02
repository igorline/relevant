import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfScroll from 'modules/listview/web/infScroll.component';
import Post from 'modules/post/web/post.component';

class UserPosts extends Component {
  static propTypes = {
    pageSize: PropTypes.number,
    load: PropTypes.func,
    match: PropTypes.object,
    posts: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      postsToRender: [],
      isInfiniteLoading: false
    };
    this.load = this.load.bind(this);
  }

  load(page, length) {
    this.hasMore = page * this.props.pageSize <= length;
    if (this.hasMore) {
      this.props.load(length);
    }
  }

  render() {
    const userId = this.props.match.params.id;
    const postIds = this.props.posts.userPosts[userId] || [];

    const posts = postIds.map(id => {
      const post = this.props.posts.posts[id];
      const link = this.props.posts.links[post.metaPost];
      if (!post) return null;
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user
      };

      return (
        <Post
          key={id}
          post={post}
          link={link}
          repost={repost}
          postUser={postUser}
          {...this.props}
        />
      );
    });

    const { length } = posts;
    return (
      <InfScroll
        data={postIds}
        loadMore={p => this.load(p, length)}
        hasMore={this.hasMore}
      >
        <div className={'postContainer userPosts'}>{posts}</div>
      </InfScroll>
    );
  }
}

export default UserPosts;
