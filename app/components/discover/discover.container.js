import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CustomSpinner from '../CustomSpinner.component';
import Post from '../post/post.component';
import DiscoverUser from '../discoverUser.component';
import * as userActions from '../../actions/user.actions';
import * as statsActions from '../../actions/stats.actions';
import * as authActions from '../../actions/auth.actions';
import * as postActions from '../../actions/post.actions';
import * as tagActions from '../../actions/tag.actions';
import * as investActions from '../../actions/invest.actions';
import * as animationActions from '../../actions/animation.actions';
import * as navigationActions from '../../actions/navigation.actions';
import * as createPostActions from '../../actions/createPost.actions';
import { globalStyles } from '../../styles/global';
import CustomListView from '../../components/customList.component';

let styles;
const POST_PAGE_SIZE = 15;

class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      offsetY: 50,
      view: 0,
    };
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);

    this.needsReload = new Date().getTime();
    this.myTabs = [
      { id: 0, title: 'Trending', type: 'top' },
      { id: 1, title: 'New', type: 'new' },
      { id: 2, title: 'People', type: 'people' },
    ];
    this.loaded = true;
    this.type = this.props.type;
    this.state.view = this.myTabs.find(tab => tab.type === this.type).id;
  }

  componentWillMount() {
    if (this.props.scene) {
      this.topic = this.props.scene.topic;
      this.filter = this.topic ? [this.topic] : [];
    }
  }

  componentWillReceiveProps(next) {
    let type = this.myTabs[this.state.view].type;
    if (this.props.tags.selectedTags !== next.tags.selectedTags && type !== 'people') {
      this.filter = next.tags.selectedTags;
      this.needsReload = new Date().getTime();
    }
    if (this.props.refresh !== next.refresh && this.props.active) {
      if (this.scrollOffset === -50) {
        // this.setState({ view: 0 });
      } else {
        this.scrollToTop();
      }
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }
  }

  shouldComponentUpdate(next) {
    if (!next.active) return false;
    return true;
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        if (this.topic) {
          return {
            data: props.posts.topics.top[this.topic._id],
            loaded: props.posts.loaded.topics[this.topic._id] ?
              props.posts.loaded.topics[this.topic._id].top : false,
          };
        }
        return {
          data: props.posts.top,
          loaded: props.posts.loaded.top,
        };
      case 1:
        if (this.topic) {
          return {
            data: props.posts.topics.new[this.topic._id],
            loaded: props.posts.loaded.topics[this.topic._id] ?
              props.posts.loaded.topics[this.topic._id].new : false
          };
        }
        return {
          data: props.posts.new,
          loaded: props.posts.loaded.new
        };
      case 2:
        return {
          data: props.userList[this.topic ? this.topic._id : 'all'],
          loaded: null
        };
      default:
        return null;
    }
  }

  scrollToTop() {
    let view = this.listview;
    if (view) view.listview.scrollTo({ y: -this.props.offsetY, animated: true });
  }

  load(view, length) {
    if (!view) view = this.state.view;
    if (!length) length = 0;
    const tags = this.filter;
    switch (view) {
      case 0:
        this.props.actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE);
        break;
      case 1:
        this.props.actions.getPosts(length, tags, null, POST_PAGE_SIZE);
        break;
      case 2:
        if (this.props.auth.user) this.props.actions.getUsers(length, POST_PAGE_SIZE * 2, tags);
        break;
      default:
        return;
    }
  }

  renderRow(rowData, view, i) {
    let type = this.myTabs[view].type;
    if (view !== 2) {
      let posts = [];
      let metaPost = this.props.posts.metaPosts[type][rowData];
      if (metaPost) posts = metaPost.commentary.map(p => this.props.posts.posts[p]);
      else return null;

      let showReposts = false;
      if (type === 'new') showReposts = true;

      return (<Post
        tooltip={parseInt(i) === 0 || false}
        metaPost={metaPost}
        showReposts={showReposts}
        commentary={posts}
        actions={this.props.actions}
        styles={styles}
      />);
    }
    let topic = this.topic ? this.topic._id : null;
    return (<DiscoverUser
      bio
      relevance={this.topic || false}
      topic={topic}
      user={rowData}
      {...this.props}
    />);
  }

  render() {
    let dataEl = [];

    if (this.loaded) {
      let tabData = this.getViewData(this.props, this.state.view) || [];
      dataEl = (
        <CustomListView
          ref={c => this.listview = c}
          key={this.state.view}
          data={tabData.data || []}
          loaded={tabData.loaded}
          renderRow={this.renderRow}
          load={this.load}
          type={'posts'}
          parent={'discover'}
          view={this.state.view}
          active={this.props.active}
          YOffset={this.props.offsetY}
          onScroll={this.props.onScroll}
          needsReload={this.needsReload}
          scrollableTab
          error={this.props.error}
        />);
    }

    // if (!this.loaded) dataEl = <CustomSpinner />;

    return (
      <View style={{ backgroundColor: 'hsl(0,0%,100%)', flex: 1 }}>
        {dataEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  padding20: {
    padding: 20,
  },
  listStyle: {
    height: 100,
  },
  listScroll: {
    height: 100,
    borderWidth: 1,
    borderColor: 'red',
  },
  scrollPadding: {
    marginTop: 300,
  },
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    animation: state.animation,
    view: state.view,
    stats: state.stats,
    userList: state.user.list,
    tags: state.tags,
    error: state.error.discover,
    refresh: state.navigation.discover.refresh,
    reload: state.navigation.discover.reload,
    tabs: state.navigation.tabs,
    topics: state.navigation.showTopics
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...postActions,
        ...animationActions,
        ...tagActions,
        ...investActions,
        ...userActions,
        ...statsActions,
        ...authActions,
        ...navigationActions,
        ...createPostActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
