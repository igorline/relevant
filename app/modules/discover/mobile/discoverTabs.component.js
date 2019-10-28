/* eslint-disable */
import React, { Component } from 'react';
import { StyleSheet, View, Platform, StatusBar, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated from 'react-native-reanimated';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { globalStyles, fullWidth, fullHeight, blue } from 'app/styles/global';
import { getParentTags } from 'modules/tag/tag.actions';
import { goToTopic, registerGesture } from 'modules/navigation/navigation.actions';
import Topics from 'modules/createPost/mobile/topics.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import get from 'lodash/get';
import { TabView, SceneMap } from 'react-native-tab-view';
import DefaultTabBar from './discoverTabBar.component';
import Discover from './discover.container';
import DiscoverHeader from './discoverHeader.component';

let styles;

class DiscoverTabs extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    view: PropTypes.object,
    actions: PropTypes.object,
    topics: PropTypes.bool,
    tags: PropTypes.object
  };

  tabView = React.createRef();
  position = new Animated.Value(0);

  constructor(props, context) {
    super(props, context);
    this.state = {
      index: 0,
      routes: [
        // { key: 'feed', title: SUB_TITLE },
        { key: 'new', title: 'New' },
        { key: 'top', title: 'Top' }
      ],
      headerHeight: 50
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderBadge = this.renderBadge.bind(this);
    this.scrollOffset = {};
    this.initialTab = 0;

    const { params } = this.props.navigation.state;
    if (params && params.topic) {
      this.mainDiscover = false;
      this.topicView = true;
      this.topicId = params.id;
      this.state.routes = [
        { key: 'new', title: 'New' },
        { key: 'top', title: 'Top' }
        // { key: 'people', title: 'People' }
      ];
    }
    this.loaded = false;
  }

  componentDidMount() {
    if (this.topicId) {
      this.needsReload = new Date().getTime();
      requestAnimationFrame(() => {
        this.loaded = true;
        this.setState({});
      });
    } else {
      this.loaded = true;
    }
  }

  componentDidUpdate(prev) {
    const { navigation, view } = this.props;
    const newSortUrlParam = get(navigation, 'state.params.sort');
    const oldSortUrlParam = get(prev.navigation, 'state.params.sort');

    let tabId = view.discover.tab;
    if (newSortUrlParam && newSortUrlParam !== oldSortUrlParam) {
      tabId = this.state.routes.findIndex(r => r.key === newSortUrlParam);
    }
    if (tabId > -1 && tabId !== prev.view.discover.tab && tabId !== this.state.index) {
      this.tabView.goToPage(tabId);
    }
  }

  onScroll = event => {
    // this.header.onScroll(event);
  };

  setPostTop(height) {
    this.setState({ headerHeight: height });
  }

  handleChangeTab(index) {
    // this.header.showHeader();
    this.setState({ index });
    this.props.actions.setView('discover', index);
  }

  renderScene({ route }) {
    const { index } = this.state;
    const currentRoute = this.state.routes[index] || {};
    if (!this.loaded) return <View key={route.key} />;
    switch (route.key) {
      case 'feed':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'twitterFeed'}
            key={'twitterFeed'}
            navigation={this.props.navigation}
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
            navigation={this.props.navigation}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
          />
        );
      case 'top':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'top'}
            key={'top'}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
            navigation={this.props.navigation}
          />
        );
      case 'people':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'people'}
            key={'people'}
            onScroll={this.onScroll}
            offsetY={this.state.headerHeight}
            tabLabel={route.title}
            navigation={this.props.navigation}
          />
        );
      default:
        return null;
    }
  }

  renderBadge() {
    // if (title !== SUB_TITLE) return null;
    // const count = this.props.feedUnread;
    // if (typeof count === 'number') {
    //   this.totalBadge += count;
    // }
    // if (!count) return null;
    // return (
    //   <Text
    //     style={{
    //       backgroundColor: 'transparent',
    //       fontSize: 14,
    //       fontWeight: 'bold',
    //       position: 'absolute',
    //       color: 'red',
    //       // color: blue,
    //       top: -1,
    //       right: -10
    //     }}
    //   >
    //     {'•'}
    //   </Text>
    // );
  }

  renderHeader(props) {
    if (!this.loaded) return <View {...props} />;
    return (
      <DiscoverHeader ref={c => (this.header = c)} setPostTop={this.setPostTop}>
        <DefaultTabBar
          tabStyle={{ paddingBottom: 0 }}
          style={{
            height: 50,
            paddingBottom: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: 'black'
          }}
          textStyle={{}}
          initialTab={this.initialTab}
          renderBadge={this.renderBadge}
          topic={this.topicId || 'default'}
          {...props}
        />
      </DiscoverHeader>
    );
  }

  render() {
    // const tabs = this.state.routes.map(route => this.renderScene(route));
    let topics = null;
    if (this.props.topics) {
      topics = (
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: fullWidth,
            height:
              fullHeight -
              108 -
              (Platform.OS === 'android' ? StatusBar.currentHeight - 14 : 0)
          }}
        >
          <Topics
            topics={this.props.tags.parentTags}
            action={topic => {
              this.props.actions.goToTopic(topic);
            }}
            actions={this.props.actions}
          />
        </View>
      );
    }

    // if (!this.loaded) {
    //   return <CustomSpinner />;
    // }

    // console.log(tabs);
    // console.log(this.tabView);
    // console.log('render pos', this.position);
    // const drawer = getHandler('drawer');

    return (
      <View style={{ flex: 1 }}>
        <PositionListener position={this.position} tabView={this.tabView} />
        <TabView
          gestureHandlerProps={{
            ref: this.tabView
            // simultaneousHandlers: drawer
            // onGestureEvent: console.log,
            // onHandlerStateChange: console.log
          }}
          position={this.position}
          // onSwipeStart={e => console.log('start', e)}
          navigationState={this.state}
          renderScene={this.renderScene}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get('window').width }}
        />

        {/*        <ScrollableTabView
          ref={c => (this.tabView = c)}
          tabBarTextStyle={styles.tabFont}
          tabBarActiveTextColor={blue}
          initialPage={this.initialTab}
          // initialPage={this.initialTab}
          tabBarUnderlineStyle={{ backgroundColor: blue }}
          onChangeTab={tab => {
            this.setState({ index: tab.i });
            if (this.header) {
              this.header.showHeader();
            }
          }}
          prerenderingSiblingsNumber={Infinity}
          contentProps={{
            bounces: false,
            forceSetResponder: () => {
              this.props.actions.scrolling(true);
              clearTimeout(this.scrollTimeout);
              this.scrollTimeout = setTimeout(
                () => this.props.actions.scrolling(false),
                80
              );
            }
          }}
          renderTabBar={props => this.renderHeader(props)}
        >
          {tabs}
        </ScrollableTabView>*/}
        {topics}
        <CustomSpinner visible={!this.loaded} />
      </View>
    );
  }
}

function PositionListener({ position, tabView }) {
  const dispatch = useDispatch();
  const g = useSelector(state => state.navigation.gestures);
  const tabViewGesture = useSelector(state => state.navigation.gestures.tabView);
  const active = tabViewGesture && tabViewGesture.active;
  return (
    <React.Fragment>
      <Animated.Code
        exec={Animated.onChange(
          position,
          Animated.call([position], ([value]) => {
            const isActive = value > 0.0001;
            dispatch(
              registerGesture({ name: 'tabView', active: isActive, gesture: tabView })
            );
          })
        )}
      />
    </React.Fragment>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1
  }
});

styles = { ...globalStyles, ...localStyles };

function mapStateToProps(state) {
  return {
    tags: state.tags,
    view: state.view,
    topics: state.navigation.showTopics,
    feedUnread: state.posts.feedUnread
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getParentTags,
        goToTopic,
        registerGesture
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscoverTabs);
