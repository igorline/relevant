import React, { PureComponent } from 'react';
import { StyleSheet, Text, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import Feed from './feed.container';
import Discover from './discover.container';
import DiscoverHeader from './discoverHeader.component';
import { globalStyles, blue, fullWidth } from '../../styles/global';

let styles;

export default class DiscoverTabs extends PureComponent {
  static propTypes = {
    scene: PropTypes.object,
    error: PropTypes.string,
    navigationState: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      index: 0,
      routes: [
        { key: 'feed', title: 'Subscriptions' },
        { key: 'new', title: 'New' },
        { key: 'trending', title: 'Trending' }
      ],
      headerHeight: 50
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.scrollOffset = {};
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
        console.log('loaded');
        this.loaded = true;
        this.setState({});
      });
    } else {
      this.setState({ index: 1 });
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

  renderScene({ route }) {
    const index = this.state.index;
    const currentRoute = this.state.routes[index];
    switch (route.key) {
      case 'feed':
        return (
          <Feed
            active={currentRoute.key === route.key}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
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
          />
        );
      default:
        return null;
    }
  }

  renderHeader(props) {
    if (this.props.error) return null;
    const index = props.navigationState.index;
    const currentRoute = props.navigationState.routes[index];
    return (
      <DiscoverHeader ref={c => (this.header = c)} setPostTop={this.setPostTop}>
        <TabBar
          getLabelText={({ route }) => (route.title ? route.title : null)}
          renderLabel={({ route }) => {
            const active = currentRoute.key === route.key;
            return (
              <Text
                style={[styles.tabFont, active ? styles.active : null, { textAlign: 'center' }]}
              >
                {route.title}
              </Text>
            );
          }}
          style={{ backgroundColor: 'white' }}
          tabStyle={{
            height: 50,
            borderBottomColor: 'black',
            borderBottomWidth: StyleSheet.hairlineWidth
          }}
          pressOpacity={1}
          labelStyle={[styles.tabStyle]}
          indicatorStyle={{ backgroundColor: blue, height: 4 }}
          {...props}
        />
      </DiscoverHeader>
    );
  }

  render() {
    return (
      <TabViewAnimated
        style={[styles.container]}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        onRequestChangeTab={this.handleChangeTab}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1
  }
});

styles = { ...globalStyles, ...localStyles };
