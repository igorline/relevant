import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import Post from '../components/post/post.component';
import DiscoverUser from '../components/discoverUser.component';
import DiscoverHeader from '../components/discoverHeader.component';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';
import * as navigationActions from '../actions/navigation.actions';
import * as createPostActions from '../actions/createPost.actions';
import { globalStyles } from '../styles/global';
import ErrorComponent from '../components/error.component';
import CustomListView from '../components/customList.component';

let styles;
const POST_PAGE_SIZE = 5;

class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      headerHeight: 50,
      showHeader: true,
      offsetY: 0,
    };
    this.onScroll = this.onScroll.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
    this.load = this.load.bind(this);
    this.changeView = this.changeView.bind(this);
    this.setCurrentView = this.setCurrentView.bind(this);
    this.offset = 0;
    this.needsReload = new Date().getTime();
    this.myTabs = [
      { id: 0, title: 'Trending', type: 'top' },
      { id: 1, title: 'New', type: 'new' },
      { id: 2, title: 'People', type: 'people' },
    ];
    this.lastOffset = -50;
    this.view = 0;
  }

  componentWillReceiveProps(next) {
    let type = this.myTabs[next.view.discover].type;
    if (this.props.tags.selectedTags !== next.tags.selectedTags && type !== 'people') {
      this.needsReload = new Date().getTime();
    }
    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }
    if (next.view.discover !== this.view) {
      this.tabView.goToPage(next.view.discover);
    }
  }

  shouldComponentUpdate(next) {
    let tab = next.tabs.routes[next.tabs.index];
    if (tab.key !== 'discover') return false;
    // if (next.nav.index > 0) return false;
    // console.log(next);
    // console.log('updating discover');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ', pp);
    //     }
    //   }
    // }

    return true;
  }

  onScroll(event) {
    this.header.onScroll(event);
  }

  setPostTop(height) {
    this.setState({ headerHeight: height });
  }

  scrollToTop() {
    let view = this.myTabs[this.props.view.discover].component.listview;
    if (view) view.scrollTo({ y: -this.state.headerHeight, animated: true });
  }

  setCurrentView(view) {
    this.view = view;
    this.props.actions.setView('discover', view);
  }

  changeView(view) {
    this.view = view;
    if (view === this.props.view.discover) {
      this.scrollToTop();
    } else {
      this.tabView.goToPage(view);
      this.props.actions.setView('discover', view);
    }
  }

  load(view, length) {
    if (!view) view = this.props.view.discover;
    if (!length) length = 0;

    const tags = this.props.tags.selectedTags;
    switch (view) {
      case 0:
        this.props.actions.getPosts(length, tags, 'rank', POST_PAGE_SIZE);
        break;
      case 1:
        this.props.actions.getPosts(length, tags, null, POST_PAGE_SIZE);
        break;
      case 2:
        if (this.props.auth.user) this.props.actions.getUsers(length, POST_PAGE_SIZE * 2);
        break;
      default:
        return;
    }
  }


  renderRow(rowData, view) {
    let type = this.myTabs[view].type;
    if (view !== 2) {
      let posts = [];
      if (!this.props.tags.selectedTags.length) {
        let metaPost = this.props.posts.metaPosts[type][rowData];
        if (metaPost) posts = metaPost.commentary;
        else return null;
      } else {
        posts = rowData;
        if (rowData === null) return null;
      }
      let showReposts = false;
      if (type === 'new') showReposts = true;
      return (<Post showReposts={showReposts} post={posts} {...this.props} styles={styles} />);
    }
    return (<DiscoverUser user={rowData} {...this.props} styles={styles} />);
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        return props.posts.top;
      case 1:
        return props.posts.new;
      case 2:
        return props.userList;
      default:
        return null;
    }
  }

  renderHeader() {
    if (this.props.error) return null;
    return (
      <DiscoverHeader
        ref={(c => this.header = c)}
        triggerReload={this.scrollToTop}
        offsetY={this.state.offsetY}
        showHeader={this.state.showHeader}
        tags={this.props.tags}
        posts={this.props.posts}
        view={this.props.view.discover}
        setPostTop={this.setPostTop}
        actions={this.props.actions}
        changeView={this.changeView}
        myTabs={this.myTabs}
      />);
  }

  render() {
    let dataEl = [];
    this.myTabs.forEach((tab) => {
      let tabData = this.getViewData(this.props, tab.id) || [];
      let active = this.props.view.discover === tab.id;
      dataEl.push(
        <CustomListView
          ref={(c) => { this.myTabs[tab.id].component = c; }}
          key={tab.id}
          data={tabData}
          renderRow={this.renderRow}
          load={this.load}
          type={tab.type}
          parent={'discover'}
          view={tab.id}
          active={active}
          YOffset={this.state.headerHeight}
          onScroll={this.onScroll}
          needsReload={this.needsReload}
          scrollableTab
        />
      );
    });

    if (this.props.error) {
      dataEl = [];
    }

    return (
      <View style={{ backgroundColor: 'hsl(0,0%,100%)', flex: 1 }}>
        <ScrollableTabView
          onChangeTab={(tab) => {
            this.setCurrentView(tab.i);
            this.header.showHeader();
          }}
          renderTabBar={() => this.renderHeader()}
          // onScroll={() => this.header.showHeader()}
          ref={tabView => this.tabView = tabView}
        >
          {dataEl}
        </ScrollableTabView>

        <ErrorComponent parent={'discover'} reloadFunction={this.load} />
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
    // nav: state.navigation.discover,
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
