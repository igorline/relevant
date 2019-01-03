import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as authActions from 'modules/auth/auth.actions';
import * as adminActions from 'modules/admin/admin.actions';
import * as postActions from 'modules/post/post.actions';
import * as userActions from 'modules/user/user.actions';
import * as notifActions from 'modules/activity/activity.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as investActions from 'modules/post/invest.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import CreatePost from 'modules/createPost/web/createPost.container';
import Sidebar from 'modules/navigation/web/sidebar.component';
import DiscoverPosts from './discoverPosts.component';
import DiscoverUsers from './discoverUsers.component';
import * as discoverHelper from './discoverHelper';

const POST_PAGE_SIZE = 15;

if (process.env.BROWSER === true) {
  require('./discover.css');
}

export class Discover extends Component {
  static propTypes = {
    match: PropTypes.object,
    refresh: PropTypes.object,
    auth: PropTypes.object,
    posts: PropTypes.object,
    user: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    const { params } = this.props.match;
    this.state = {
      tabIndex: 1,
      routes: params.tag
        ? discoverHelper.tagRoutes
        : discoverHelper.standardRoutes
    };
    const { sort } = params;
    if (sort) {
      this.state.tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
    }
    this.load = this.load.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
    this.lastRefresh = 0;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return discoverHelper.getDiscoverState(nextProps, prevState);
  }

  componentDidUpdate(prevProps) {
    let alreadyLoading;
    const { tag, sort } = this.props.match.params;

    if (this.props.refresh && this.props.refresh > this.lastRefresh) {
      this.lastRefresh = this.props.refresh;
      this.load(sort, this.props);
      alreadyLoading = true;
    }

    const userId = this.props.auth.user ? this.props.auth.user._id : null;
    const prevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    // TODO should we do this w refresh instead? when we log in / out?
    if (userId !== prevUserId && !alreadyLoading) {
      this.load(sort, this.props);
      alreadyLoading = true;
    }

    if (tag !== prevProps.match.params.tag) {
      this.load(sort, this.props);
      alreadyLoading = true;
    }
  }

  getLoadedState() {
    const sort = this.state.routes[this.state.tabIndex].key;
    const { tag } = this.props.match.params;
    const loadLookup = tag
      ? this.props.posts.loaded.topics[tag]
      : this.props.posts.loaded;
    switch (sort) {
      case 'people':
        return !this.props.user.loading;
      default:
        return loadLookup && loadLookup[sort];
    }
  }

  load(sort, props, _length) {
    if (!this.state.routes[this.state.tabIndex]) return;
    const { community } = this.props.auth;
    sort = sort || this.state.routes[this.state.tabIndex].key;
    props = props || this.props;
    const tags = props.match.params.tag ? [props.match.params.tag] : [];
    const length = _length || 0;
    switch (sort) {
      case 'feed':
        this.props.actions.getFeed(length, tags);
        break;
      case 'new':
        this.props.actions.getPosts(length, tags, null, POST_PAGE_SIZE, community);
        break;
      case 'top':
        this.props.actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE, community);
        break;
      case 'people':
        if (this.props.auth.user) {
          this.props.actions.getUsers(length, POST_PAGE_SIZE * 2, tags);
        }
        break;
      default:
        break;
    }
  }

  renderFeed() {
    const sort = this.state.routes[this.state.tabIndex].key;
    const { tag } = this.props.match.params;
    switch (sort) {
      case 'people':
        return (
          <DiscoverUsers
            key={'users' + tag}
            tag={tag}
            pageSize={POST_PAGE_SIZE}
            {...this.props}
          />
        );
      default:
        return (
          <DiscoverPosts
            key={'posts' + sort + tag}
            sort={sort}
            load={this.load}
            tag={tag}
            pageSize={POST_PAGE_SIZE}
            {...this.props}
          />
        );
    }
  }

  render() {
    if (!this.state.routes[this.state.tabIndex]) return null;
    const { auth, match } = this.props;
    const { tag } = match.params;

    return (
      <div className="discoverContainer row pageContainer">
        <div className="discoverInner">
          <div className="postContainer">
            {tag && (
              <h3>
                <Link to="/discover/new">{auth.community}</Link> - #{tag}
              </h3>
            )}
            <CreatePost {...this.props} />
            {this.renderFeed()}
          </div>
        </div>
        <Sidebar {...this.props} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.user,
    posts: state.posts,
    tags: state.tags,
    error: state.error.discover,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    refresh: state.view.refresh.discover
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...postActions,
        ...notifActions,
        ...userActions,
        ...investActions,
        ...navigationActions,
        ...tagActions,
        ...adminActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Discover);
