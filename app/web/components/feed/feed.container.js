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

import FeedTabs from './feedTabs.component';
import Posts from './posts.component';
import Loading from '../common/loading.component';

const POST_PAGE_SIZE = 5;

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./feed.css');
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

export class Feed extends Component {
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

  componentWillMount(props) {
    this.load()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.sort !== nextProps.params.sort ||
        this.props.params.tag !== nextProps.params.tag) {
      this.load(nextProps.params.sort, nextProps);
      if (nextProps.params.sort) {
        const sort = nextProps.params.sort;
        const tabIndex = this.state.routes.findIndex(tab => tab.key === sort);
        const routes = nextProps.params.tag ? tagRoutes : standardRoutes;
        this.setState({ tabIndex, routes })
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.tabIndex !== nextState.tabIndex) {
      // this.load( this.state.routes[nextState.tabIndex].key, nextProps )
    }
  }

  load(sort, props) {
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
    const sort = this.state.routes[this.state.tabIndex].key;
    const tag = this.props.params.tag;
    let content;
    if (sort === 'people') {
      content = (
        <div>USER LIST</div>
      );
    }
    else {
      content = (
        <Posts sort={sort} tag={this.props.params.tag} {...this.props} />
      );
    }
    let loadLookup = tag ? this.props.posts.loaded.topics[tag] : this.props.posts.loaded;
    let isLoaded = loadLookup[sort];
    console.log(this.props.posts)
    return (
      <div className="feedContainer postContainer">
        {this.props.params.tag &&
          <h1>{this.props.params.tag}</h1>
        }
        <FeedTabs
          tag={this.props.params.tag}
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
    user: state.auth.user,
    posts: state.posts,
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

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
