import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

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

import CreatePost from '../createPost/createPost.container';
import DiscoverTabs from './discoverTabs.component';
import DiscoverPosts from './discoverPosts.component';
import DiscoverUsers from './discoverUsers.component';
// import Loading from '../common/loading.component';
import Wallet from '../wallet/wallet.container';
import * as discoverHelper from './discoverHelper';
import ShadowButton from '../common/ShadowButton';
import Sidebar from '../common/sidebar.component';

const POST_PAGE_SIZE = 5;

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./discover.css');
}

export class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 1,
      routes: this.props.params.tag ?
        discoverHelper.tagRoutes : discoverHelper.standardRoutes,
    };
    if (this.props.params.sort) {
      const sort = this.props.params.sort;
      this.state.tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
    }
    this.load = this.load.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
    this.lastRefresh = 0;
  }

  componentDidMount() {
    this.load();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return discoverHelper.getDiscoverState(nextProps, prevState);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.refresh && this.props.refresh > this.lastRefresh) {
      this.lastRefresh = this.props.refresh;
      this.load(this.props.params.sort, this.props);
    }
    if (this.props.params.tag !== prevProps.params.tag) {
      this.load(this.props.params.sort, this.props);
    }
  }


  getLoadedState() {
    const sort = this.state.routes[this.state.tabIndex].key;
    const tag = this.props.params.tag;
    let loadLookup = tag ? this.props.posts.loaded.topics[tag] : this.props.posts.loaded;
    switch (sort) {
      case 'people':
        return !this.props.user.loading;
      default:
        return loadLookup && loadLookup[sort];
    }
  }

  load(sort, props, _length) {
    if (!this.state.routes[this.state.tabIndex]) return;
    let community = this.props.auth.community;
    sort = sort || this.state.routes[this.state.tabIndex].key;
    props = props || this.props;
    const tags = props.params.tag ? [props.params.tag] : [];
    let length = _length || 0;
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
        if (this.props.auth.user) this.props.actions.getUsers(length, POST_PAGE_SIZE * 2, tags);
        break;
      default:
        return;
    }
  }

  renderFeed() {
    const sort = this.state.routes[this.state.tabIndex].key;
    const tag = this.props.params.tag;
    switch (sort) {
      case 'people':
        return (<DiscoverUsers
          key={'users' + tag}
          tag={tag}
          pageSize={POST_PAGE_SIZE}
          {...this.props}
        />);
      default:
        return (<DiscoverPosts
          key={'posts' + sort + tag}
          sort={sort}
          load={this.load}
          tag={tag}
          pageSize={POST_PAGE_SIZE}
          {...this.props}
        />);
    }
  }

  render() {
    if (!this.state.routes[this.state.tabIndex]) return null;
    const tag = this.props.params.tag;
    let sidebar = <Sidebar {...this.props} />;

    return (
      <div className="discoverContainer row pageContainer">

{/*        <nav>
          communities:
            <ul>
              <a href="localhost:3000/discover/new">relevant</a>
              <a href="crypto.z.localhost:3000/discover/new">crypto</a>
            </ul>
        </nav>*/}

        <div className="discoverInner">
          <div className="postContainer">
            {tag &&
              <h3><Link to='/discover/new'>{this.props.auth.community}</Link> - #{tag}</h3>
            }
            <CreatePost {...this.props} />
            { this.renderFeed() }
            {/* isLoaded ? this.renderFeed() : <Loading />*/}
          </div>
        </div>
        <Sidebar {...this.props} />
      </div>
    );
  }
}

Discover.propTypes = {
  posts: PropTypes.object,
  params: PropTypes.object,
  user: PropTypes.object,
  auth: PropTypes.object,
  actions: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.user,
    posts: state.posts,
    tags: state.tags,
    error: state.error.universal,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    refresh: state.view.refresh.discover
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
