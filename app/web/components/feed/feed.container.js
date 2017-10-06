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

const POST_PAGE_SIZE = 5;

if (process.env.BROWSER === true) {
  require('../post/post.css');
  require('./feed.css');
}

export class Feed extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 1,
      routes: [
        { key: 'feed', title: 'Subscriptions' },
        { key: 'new', title: 'New' },
        { key: 'top', title: 'Trending' },
      ],
    };
    if (this.props.scene) {
      this.state.routes = [
        { key: 'new', title: 'New' },
        { key: 'top', title: 'Trending' },
        { key: 'people', title: 'People' },
      ];
    }
    this.load = this.load.bind(this)
    this.switchTab = this.switchTab.bind(this)
  }

  componentWillMount(props){
    this.load()
  }

  load(key) {
    key = key || this.state.routes[this.state.tabIndex].key;
    const tags = this.props.params.tag ? [this.props.params.tag] : [];
    const length = 0;
    console.log('load', key)
    switch (key) {
      case 'feed':
        this.props.actions.getFeed(length, tags);
        break;
      case 'new':
        this.props.actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE);
        break;
      case 'top':
        this.props.actions.getPosts(length, tags, null, POST_PAGE_SIZE);
        break;
      case 'people':
        if (this.props.auth.user) this.props.actions.getUsers(length, POST_PAGE_SIZE * 2, tags);
        break;
    }
  }

  switchTab(tabIndex) {
    this.setState({ tabIndex })
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.tabIndex !== nextState.tabIndex) {
      this.load( this.state.routes[nextState.tabIndex].key )
    }
  }

  render() {
    const key = this.state.routes[this.state.tabIndex].key;
    let content;
    if (key === 'people') {
      content = (
        <div>USER LIST</div>
      );
    }
    else {
      content = (
        <Posts section={key} {...this.props} />
      );
    }
    return (
      <div className="postContainer">
        <FeedTabs
          tabs={this.state.routes}
          currentTab={this.state.tabIndex}
          onChange={this.switchTab}
        />
        {content}
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
