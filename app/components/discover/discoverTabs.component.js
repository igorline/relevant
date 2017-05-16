import React, { PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  InteractionManager
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from './discoverTabBar.component';
import Feed from './feed.container';
import Discover from './discover.container';
import DiscoverHeader from './discoverHeader.component';
import { globalStyles, blue } from '../../styles/global';

let styles;

export default class DiscoverTabs extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      index: 1,
      routes: [
        { key: 'feed', title: 'Subscriptions' },
        { key: 'new', title: 'New' },
        { key: 'trending', title: 'Trending' },
      ],
      headerHeight: 50,
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.scrollOffset = {};
    this.initialTab = 1;
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
      // this.setState({ index: 1 });
      // this.filter = this.props.tags.selectedTags;
    }
  }

  componentDidMount() {
    // swipe to default tab here
    // if (this.props.view.discover !== this.state.view && this.mainDiscover) {
    //   this.setState({ view: this.props.view.discover });
    //   this.tabView.goToPage(this.state.view);
    // }
    // this.setState({ index: 1 });
  }

  componentWillReceiveProps(next) {
    // handle prop discover switch
    // if (next.view.discover !== this.props.view.discover) {
    //   this.setState({ view: next.view.discover.tab });
    // }
  }

  onScroll(event, key) {
    // this.scrollOffset[key] = event.nativeEvent.contentOffset.y;
    this.header.onScroll(event);
  }

  setPostTop(height) {
    this.setState({ headerHeight: height });
  }

  handleChangeTab(index) {
    this.header.showHeader();
    this.setState({ index });
  }

  renderScene(route) {
    let index = this.state.index;
    let currentRoute = this.state.routes[index];
    switch (route.key) {
      case 'feed':
        return (
          <Feed
            key={'feed'}
            active={currentRoute.key === route.key}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
          />
        );
      case 'new':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'new'}
            key={'new'}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
          />
        );
      case 'trending':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'top'}
            key={'top'}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
          />
        );
      default:
        return null;
    }
  };

  renderHeader(props) {
    return (
      <DiscoverHeader
        ref={(c => this.header = c)}
        setPostTop={this.setPostTop}
      >
        <DefaultTabBar
          tabStyle={{ paddingBottom: 0 }}
          style={{
            height: 50,
            paddingBottom: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: 'black'
          }}
          {...props}
        />
      </DiscoverHeader>
    );
  }

  render() {
    let tabs = this.state.routes.map(route => this.renderScene(route));

    return (
      <ScrollableTabView
        tabBarTextStyle={[styles.tabFont]}
        tabBarActiveTextColor={blue}
        initialPage={this.initialTab}
        tabBarUnderlineStyle={{ backgroundColor: blue }}
        onChangeTab={(tab) => {
          this.setState({ index: tab.i });
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
        renderTabBar={(props) => this.renderHeader(props)}
        ref={tabView => this.tabView = tabView}
      >
        {tabs}
      </ScrollableTabView>
    );
  }
}

let localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

styles = { ...globalStyles, ...localStyles };

