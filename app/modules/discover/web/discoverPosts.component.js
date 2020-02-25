import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfScroll from 'modules/listview/web/infScroll.component';
import PostComponent from 'modules/post/web/post.component';
import get from 'lodash/get';

class DiscoverPosts extends Component {
  static propTypes = {
    posts: PropTypes.object,
    pageSize: PropTypes.number,
    load: PropTypes.func,
    sort: PropTypes.string,
    tag: PropTypes.string,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.load = this.load.bind(this);
    this.hasMore = true;
  }

  getData(sort, tag) {
    let data;
    if (sort === 'feed') {
      data = this.props.posts.feed;
    } else {
      data = tag ? this.props.posts.topics[sort][tag] : this.props.posts[sort];
    }
    return data || [];
  }

  load(page, length) {
    this.hasMore = page * this.props.pageSize <= length;
    if (this.hasMore) {
      this.props.load(null, null, length);
    }
  }

  renderFeed() {
    return this.props.posts.feed.map(id => {
      const post = this.props.posts.posts[id];
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;

      return <Post key={id} post={post} repost={repost} />;
    });
  }

  renderDiscover(sort, tag) {
    const postIds = tag ? this.props.posts.topics[sort][tag] : this.props.posts[sort];
    const { posts } = this.props.posts;

    return (postIds || []).map(id => {
      const post = posts[id];
      if (!post) return null;

      const link = this.props.posts.links[post.metaPost];
      const commentId = get(post, `${sort}.0`);
      const comment = posts[commentId];

      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;

      return (
        <PostComponent
          key={id}
          post={post}
          link={link}
          repost={repost}
          comment={comment}
        />
      );
    });
  }

  render() {
    const { sort, tag } = this.props;

    const data = this.getData(sort, tag);
    const posts = this.renderDiscover(sort, tag);

    const { length } = posts;
    // const newPosts = this.props.posts.newPostsAvailable[auth.community];
    // const refreshPosts = (
    //   <a onClick={() => this.props.actions.refreshTab('discover')}>
    //     <LinkFont ml={4} c={colors.blue}>See New Posts</LinkFont>
    //   </a>
    // );
    // {newPosts ? refreshPosts : null}

    return (
      <div style={{ position: 'relative' }}>
        <InfScroll
          // this resets the inf scroll with community
          key={this.props.auth.community}
          className={'parent'}
          data={data}
          loadMore={p => this.load(p, length)}
          hasMore={this.hasMore}
          style={{ position: 'relative' }}
        >
          {posts}
        </InfScroll>
      </div>
    );
  }
}

export default DiscoverPosts;
