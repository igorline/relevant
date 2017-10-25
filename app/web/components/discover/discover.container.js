import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authActions from '../../../actions/auth.actions';
import * as adminActions from '../../../actions/admin.actions';
import * as postActions from '../../../actions/post.actions';
import * as userActions from '../../../actions/user.actions';
import * as onlineActions from '../../../actions/online.actions';
import * as notifActions from '../../../actions/notif.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as messageActions from '../../../actions/message.actions';
import * as investActions from '../../../actions/invest.actions';
import * as navigationActions from '../../../actions/navigation.actions';
import * as utils from '../../../utils';

import CreatePost from '../createPost/createPost.container';
import DiscoverTabs from './discoverTabs.component';
import DiscoverPosts from './discoverPosts.component';
import DiscoverUsers from './discoverUsers.component';
import Loading from '../common/loading.component';

const POST_PAGE_SIZE = 5;

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./discover.css');
}

const standardRoutes = [
  { key: 'feed', title: 'Subscriptions' },
  { key: 'new', title: 'New' },
  { key: 'top', title: 'Trending' },
];

const tagRoutes = [
  { key: 'new', title: 'New' },
  { key: 'top', title: 'Trending' },
  { key: 'people', title: 'People' },
];

export class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 1,
      routes: this.props.params.tag ? tagRoutes : standardRoutes,
    };
    if (this.props.params.sort) {
      const sort = this.props.params.sort;
      this.state.tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
    }
    this.load = this.load.bind(this);
  }

  componentDidMount(props) {
    this.load();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.sort !== nextProps.params.sort ||
        this.props.params.tag !== nextProps.params.tag) {
      this.load(nextProps.params.sort, nextProps);
      if (nextProps.params.sort) {
        const sort = nextProps.params.sort;
        const tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
        const routes = nextProps.params.tag ? tagRoutes : standardRoutes;
        this.setState({ tabIndex, routes });
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.tabIndex !== nextState.tabIndex) {
      // this.load( this.state.routes[nextState.tabIndex].key, nextProps )
    }
  }

  load(sort, props) {
    if (!this.state.routes[this.state.tabIndex]) return null;
    sort = sort || this.state.routes[this.state.tabIndex].key;
    props = props || this.props;
    const tags = props.params.tag ? [props.params.tag] : [];
    const length = 0;
    switch (sort) {
      case 'feed':
        this.props.actions.getFeed(length, tags);
        break;
      case 'new':
        this.props.actions.getPosts(length, tags, null, POST_PAGE_SIZE);
        break;
      case 'top':
        this.props.actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE);
        break;
      case 'people':
        if (this.props.auth.user) this.props.actions.getUsers(length, POST_PAGE_SIZE * 2, tags);
        break;
    }
  }

  render() {
    if (!this.state.routes[this.state.tabIndex]) return null;
    const sort = this.state.routes[this.state.tabIndex].key;
    const tag = this.props.params.tag;
    let loadLookup = tag ? this.props.posts.loaded.topics[tag] : this.props.posts.loaded;
    let isLoaded;
    let content;
    if (sort === 'people') {
      content = (
        <DiscoverUsers tag={tag} {...this.props} />
      );
      isLoaded = !this.props.user.loading;
    } else {
      content = (
        <DiscoverPosts sort={sort} tag={tag} {...this.props} />
      );
      isLoaded = loadLookup && loadLookup[sort];
    }
    return (
      <div className="discoverContainer postContainer">
        <CreatePost {...this.props} />
        {tag &&
          <h1>{tag}</h1>
        }
        <DiscoverTabs
          tag={tag}
          tabs={this.state.routes}
          currentTab={this.state.tabIndex}
        />
        {isLoaded ? content : <Loading />}
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
    error: state.error.universal,
    investments: state.investments,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...messageActions,
      ...userActions,
      ...investActions,
      ...navigationActions,
      ...tagActions,
      ...adminActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
