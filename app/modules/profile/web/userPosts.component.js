import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfScroll from 'modules/listview/web/infScroll.component';
import PostComponent from 'modules/post/web/post.component';
import { View } from 'modules/styled/uni';
import { routing } from 'app/utils';

class UserPosts extends Component {
  static propTypes = {
    pageSize: PropTypes.number,
    load: PropTypes.func,
    match: PropTypes.object,
    posts: PropTypes.object,
    community: PropTypes.object
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
    const { community } = this.props;
    const userId = this.props.match.params.id;
    const postIds = this.props.posts.userPosts[userId] || [];

    const posts = postIds.map(id => {
      const post = this.props.posts.posts[id];
      if (!post) return null;
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;
      const postUser = {
        ...post.embeddedUser,
        _id: post.user
      };
      const link = this.props.posts.links[post.metaPost];

      let parentPost;
      const parentId = post.parentPost;
      if (parentId) {
        parentPost = this.props.posts.posts[parentId];
      }

      const postUrl = routing.getPostUrl(community, post);

      return (
        <View shrink={1} key={id} fdirection="column">
          <PostComponent
            post={post}
            preview
            link={{ ...parentPost, ...link }} // TODO - metapost is a pain
            repost={repost}
            postUser={postUser}
            {...this.props}
            community={community._id}
            postUrl={postUrl}
          />
        </View>
      );
    });

    const { length } = posts;
    return (
      <InfScroll
        data={postIds}
        loadMore={p => this.load(p, length)}
        hasMore={this.hasMore}
      >
        <View fdirection="column" shrink={1}>
          {posts}
        </View>
      </InfScroll>
    );
  }
}

export default UserPosts;
