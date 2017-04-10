import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  InteractionManager
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomSpinner from '../components/CustomSpinner.component';
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
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import ErrorComponent from '../components/error.component';
import CustomListView from '../components/customList.component';
import Tags from '../components/tags.component';
import Topics from '../components/createPost/topics.component';

let styles;
const POST_PAGE_SIZE = 15;

class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      headerHeight: 50,
      showHeader: true,
      offsetY: 0,
      view: 0,
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
    this.loaded = true;
    this.mainDiscover = true;
    this.scrollOffset = -50;
  }

  componentWillMount() {
    if (this.props.scene && this.props.scene.topic) {
      this.mainDiscover = false;
      this.topicView = true;
      this.filter = [this.props.scene.topic];
      this.topic = this.props.scene.topic;
      this.loaded = false;
      this.needsReload = new Date().getTime();

      this.onInteraction = InteractionManager.runAfterInteractions(() => {
        this.loaded = true;
        this.setState({});
      });
    } else {
      this.filter = this.props.tags.selectedTags;
    }
  }

  componentDidMount() {
    if (this.props.view.discover !== this.state.view && this.mainDiscover) {
      this.setState({ view: this.props.view.discover });
      this.tabView.goToPage(this.state.view);
    }
  }

  componentWillReceiveProps(next) {
    let type = this.myTabs[this.state.view].type;
    if (this.props.tags.selectedTags !== next.tags.selectedTags && type !== 'people') {
      this.filter = next.tags.selectedTags;
      this.needsReload = new Date().getTime();
    }
    if (this.props.refresh !== next.refresh) {
      if (this.scrollOffset === -50) {
        this.setState({ view: 0 });
      } else {
        this.scrollToTop();
      }
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }
    if (next.view.discover !== this.props.view.discover) {
      this.setState({ view: next.view.discover.tab });
    }
  }

  shouldComponentUpdate(next) {
    let tab = next.tabs.routes[next.tabs.index];
    if (tab.key !== 'discover' && !next.scene) return false;

    let currentScene = this.props.nav.routes[this.props.nav.index];
    if (this.props.scene && currentScene !== this.props.scene) return false;

    // console.log('updating discover ', this.topic);
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

  componentWillUpdate(nextProps, nextState) {
    if (this.state.view !== nextState.view) this.tabView.goToPage(nextState.view);
    // if (this.state.view !== nextProps.view.discover && this.mainDiscover) this.tabView.goToPage(nextProps.view.discover);
  }


  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  onScroll(event) {
    this.scrollOffset = event.nativeEvent.contentOffset.y;
    this.header.onScroll(event);
  }

  setPostTop(height) {
    this.setState({ headerHeight: height });
  }

  scrollToTop() {
    if (!this.myTabs[this.state.view].component) return;
    let view = this.myTabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y: -this.state.headerHeight, animated: true });
  }

  setCurrentView(view) {
    if (view === this.state.view) return;
    this.setState({ view });
  }

  changeView(view) {
    if (view === this.state.view) {
      this.scrollToTop();
    } else this.setCurrentView(view);
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


  renderRow(rowData, view) {
    let type = this.myTabs[view].type;
    if (view !== 2) {
      let posts = [];
      let metaPost = this.props.posts.metaPosts[type][rowData];
      if (metaPost) posts = metaPost.commentary;
      else return null;

      let showReposts = false;
      if (type === 'new') showReposts = true;
      return (<Post metaPost={metaPost} showReposts={showReposts} post={posts} {...this.props} styles={styles} />);
    }
    let topic = this.topic ? this.topic._id : null;
    return (<DiscoverUser
      relevance={this.topic || false}
      topic={topic}
      user={rowData}
      {...this.props}
    />);
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        if (this.topic) {
          return {
            data: props.posts.topics.top[this.topic._id],
            loaded: props.posts.loaded.top,
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
            loaded: props.posts.loaded.new
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
        view={this.state.view}
        setPostTop={this.setPostTop}
        actions={this.props.actions}
        changeView={this.changeView}
        myTabs={this.myTabs}
      />);
  }

  renderFilters() {
    if (this.topicView) return null;
    let tags = (
      <View>
        <Tags actions={this.props.actions} tags={this.props.tags} />
      </View>
    );

    if (this.state.view === 2) {
      tags = null;
    }

    return tags;
  }

  render() {
    let dataEl = [];

    if (this.loaded) {
      this.myTabs.forEach((tab) => {
        let tabData = this.getViewData(this.props, tab.id) || [];
        let active = this.state.view === tab.id;
        dataEl.push(
          <CustomListView
            ref={(c) => { this.myTabs[tab.id].component = c; }}
            key={tab.id}
            data={tabData.data || []}
            loaded={tabData.loaded}
            renderRow={this.renderRow}
            renderHeader={() => this.renderFilters()}
            load={this.load}
            type={'posts'}
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
    }

    if (this.props.error) {
      dataEl = [];
    }

    if (!this.loaded) dataEl = <CustomSpinner />;


    let topics;
    if (this.props.topics) {
      topics = (<View
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          width: fullWidth,
          height: fullHeight - 108,
          zIndex: 10000,
        }}
      >
        <Topics
          topics={this.props.tags.parentTags}
          action={(topic) => {
            this.setCurrentView(0);
            this.props.actions.goToTopic(topic);
          }}
          actions={this.props.actions}
        />
      </View>);
    }

    return (
      <View style={{ backgroundColor: 'hsl(0,0%,100%)', flex: 1 }}>
        {topics}
        <ScrollableTabView
          onChangeTab={(tab) => {
            this.setCurrentView(tab.i);
            this.header.showHeader();
          }}
          contentProps={{
            bounces: false,
            forceSetResponder: (e) => {
              this.props.actions.scrolling(true);
              clearTimeout(this.scrollTimeout);
              this.scrollTimeout = setTimeout(
                () => this.props.actions.scrolling(false), 80);
            }
          }}
          renderTabBar={() => this.renderHeader()}
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
    nav: state.navigation.discover,
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
