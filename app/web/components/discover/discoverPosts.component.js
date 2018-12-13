import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfScroll from '../common/infScroll.component';
import Post from '../post/post.component';

class DiscoverPosts extends Component {
  static propTypes = {
    posts: PropTypes.object,
    pageSize: PropTypes.number,
    load: PropTypes.func,
    sort: PropTypes.object,
    tag: PropTypes.object,
    auth: PropTypes.object,
    actions: PropTypes.object
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

      return <Post key={id} post={post} repost={repost} {...this.props} />;
    });
  }

  renderDiscover(sort, tag) {
    const postIds = tag ? this.props.posts.topics[sort][tag] : this.props.posts[sort];
    const posts = this.props.posts.posts;

    return (postIds || []).map(id => {
      let post = posts[id];
      if (!post) return null;

      const link = this.props.posts.links[post.metaPost];
      if (post[sort] && post[sort].length) {
        post = this.props.posts.posts[post[sort][0]];
        if (!post) return null;
      }
      // TODO test this
      if (post.twitterCommentary && post.twitterCommentary[0]) {
        post = post.twitterCommentary[0];
        if (!post) return null;
      }

      const repost = post.repost ? this.props.posts.posts[post.repost.post] : null;

      return <Post key={id} post={post} link={link} repost={repost} {...this.props} />;
    });
  }

  render() {
    const sort = this.props.sort;
    const tag = this.props.tag;
    let posts;

    const data = this.getData(sort, tag);
    if (sort === 'feed') {
      posts = this.renderFeed();
    } else {
      posts = this.renderDiscover(sort, tag);
    }
    const length = posts.length;
    const newPosts = this.props.posts.newPostsAvailable[this.props.auth.community];
    const refreshPosts = (
      <a className="refresh" onClick={() => this.props.actions.refreshTab('discover')}>
        Load latests Posts
      </a>
    );

    return (
      <div style={{ position: 'relative' }}>
        {newPosts ? refreshPosts : null}
        <InfScroll
          // this resets the inf scroll with community
          key={this.props.auth.community}
          className={'parent'}
          data={data}
          loadMore={p => this.load(p, length)}
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
  tag: PropTypes.string
};

export default DiscoverPosts;
