import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfScroll from '../common/infScroll.component';
import Post from '../post/post.component';

class DiscoverPosts extends Component {
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
    this.hasMore = (page) * this.props.pageSize <= length;
    if (this.hasMore) {
      this.props.load(null, null, length);
    }
  }

  renderFeed() {
    return this.props.posts.feed.map(id => {
      const post = this.props.posts.posts[id];
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;

      return (
        <Post
          key={id}
          post={post}
          repost={repost}
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
      if (!metaPost) return null;
      // const postId = sort === 'new' ? metaPost.newCommentary : metaPost.topCommentary;
      const postId = metaPost.commentary[0] || metaPost.twitterCommentary[0];
      const post = this.props.posts.posts[postId];
      if (!post) return null;
      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;

      // console.log(post.twitter);

      return (
        <Post
          key={id}
          metaPost={metaPost}
          post={post}
          repost={repost}
          {...this.props}
        />
      );
    });
  }

  render() {
    const sort = this.props.sort;
    const tag = this.props.tag;
    let posts;

    let data = this.getData(sort, tag);
    if (sort === 'feed') {
      posts = this.renderFeed();
    } else {
      posts = this.renderDiscover(sort, tag);
    }
    let length = posts.length;
    let newPosts = this.props.posts.newPostsAvailable[this.props.auth.community];
    let refreshPosts = (<a
      className="refresh"
      onClick={() => this.props.actions.refreshTab('discover')}
    >
      Load latests Posts
    </a>);

    return (
      <div style={{ position: 'relative' }}>
        {newPosts ? refreshPosts : null}
        <InfScroll
          className={'parent'}
          data={data}
          loadMore={(p) => this.load(p, length)}
          hasMore={this.hasMore}
        >
          {posts}
        </InfScroll>
      </div>
    );
  }
}

DiscoverPosts.propTypes = {
  pageSize: PropTypes.number,
  load: PropTypes.func,
  posts: PropTypes.object,
  sort: PropTypes.string,
  tag: PropTypes.string,
};

export default DiscoverPosts;
