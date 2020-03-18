import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import * as authActions from 'modules/auth/auth.actions';
import * as postActions from 'modules/post/post.actions';
import * as userActions from 'modules/user/user.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import { sizing } from 'app/styles';
import styled from 'styled-components/primitives';
import DiscoverPosts from './discoverPosts.component';
import * as discoverHelper from './discoverHelper';

const Wrapper = styled.View`
  display: flex;
  flex-direction: column;
  padding: 0 0 ${sizing(4)} 0;
`;

const POST_PAGE_SIZE = 15;

export class Discover extends Component {
  static propTypes = {
    match: PropTypes.object,
    refresh: PropTypes.number,
    auth: PropTypes.object,
    posts: PropTypes.object,
    user: PropTypes.object,
    actions: PropTypes.object,
    reload: PropTypes.number
  };

  static fetchData(dispatch, params) {
    const { sort, tag, community } = params;
    const length = 0; // TODO: ssr multi-page?
    const tags = tag ? [tag] : [];

    switch (sort) {
      case 'new':
        return dispatch(
          postActions.getPosts(length, tags, null, POST_PAGE_SIZE, community)
        );
      case 'top':
        return dispatch(
          postActions.getPosts(length, tags, 'rank', POST_PAGE_SIZE, community)
        );
      default:
        return null;
    }
  }

  constructor(props, context) {
    super(props, context);
    const { params } = this.props.match;
    this.state = {
      tabIndex: 1,
      routes: params.tag ? discoverHelper.tagRoutes : discoverHelper.standardRoutes
    };
    const { sort } = params;
    if (sort) {
      this.state.tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
    }
    this.load = this.load.bind(this);
    this.lastRefresh = 0;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return discoverHelper.getDiscoverState(nextProps, prevState);
  }

  componentDidMount() {
    this.props.actions.setScrollTab('discover', this.props.match.params);
  }

  componentDidUpdate(prevProps) {
    let alreadyLoading;
    const { tag, sort, community } = this.props.match.params;
    const prevTag = get(prevProps, 'match.params.tag', undefined);
    const prevSort = get(prevProps, 'match.params.sort', undefined);
    const prevCommunity = get(prevProps, 'match.params.community', undefined);
    if (tag !== prevTag || sort !== prevSort || community !== prevCommunity) {
      this.props.actions.setScrollTab('discover', this.props.match.params);
    }

    if (this.props.refresh && this.props.refresh > this.lastRefresh) {
      this.lastRefresh = this.props.refresh;
      this.load(sort, this.props);
      alreadyLoading = true;
      return;
    }

    const userId = this.props.auth.user ? this.props.auth.user._id : null;
    const prevUserId = prevProps.auth.user ? prevProps.auth.user._id : null;

    // TODO should we do this w refresh instead? when we log in / out?
    if (userId !== prevUserId && !alreadyLoading) {
      this.load(sort, this.props);
      alreadyLoading = true;
      return;
    }

    if (tag !== prevProps.match.params.tag) {
      this.load(sort, this.props);
      alreadyLoading = true;
    }

    if (this.props.reload !== prevProps.reload) {
      this.load(sort, this.props);
      alreadyLoading = true;
    }
  }

  componentWillUnmount() {
    this.props.actions.setScrollTab('discover', {});
  }

  getLoadedState() {
    const sort = this.state.routes[this.state.tabIndex].key;
    const { tag } = this.props.match.params;
    const loadLookup = tag
      ? this.props.posts.loaded.topics[tag]
      : this.props.posts.loaded;
    return loadLookup && loadLookup[sort];
  }

  load(sort, props, _length) {
    const { actions, auth } = this.props;
    if (!this.state.routes[this.state.tabIndex]) return;
    const { community } = auth;
    sort = sort || this.state.routes[this.state.tabIndex].key;
    props = props || this.props;
    const tags = props.match.params.tag ? [props.match.params.tag] : [];
    const length = _length || 0;
    switch (sort) {
      case 'new':
        actions.getPosts(length, tags, null, POST_PAGE_SIZE, community);
        break;
      case 'top':
        actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE, community);
        break;
      default:
        break;
    }
  }

  render() {
    if (!this.state.routes[this.state.tabIndex]) return null;
    const sort = this.state.routes[this.state.tabIndex].key;
    const { tag } = this.props.match.params;
    return (
      <Wrapper>
        <div>
          <DiscoverPosts
            key={'posts' + sort + tag}
            sort={sort}
            load={this.load}
            tag={tag}
            pageSize={POST_PAGE_SIZE}
            {...this.props}
          />
        </div>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.user,
    posts: state.posts,
    tags: state.tags,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    refresh: state.navigation.discover.refresh,
    reload: state.navigation.reload
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...postActions,
        ...userActions,
        ...navigationActions
      },
      dispatch
    )
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Discover)
);
