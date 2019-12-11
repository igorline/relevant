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
import {
  goToTopic,
  lockDrawer,
  setScrollTab,
  goToPage
} from 'modules/navigation/navigation.actions';
import Topics from 'modules/createPost/mobile/topics.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import get from 'lodash/get';
import { TabView, SceneMap } from 'react-native-tab-view';
import { DrawerGestureContext } from 'react-navigation-drawer';
import { TabViewContext } from './discoverTabContext';
import TabBar from './TabBar';
import Discover from './discover.container';
import DiscoverHeader from './discoverHeader.component';

let styles;

class DiscoverTabs extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    tabId: PropTypes.number,
    actions: PropTypes.object,
    topics: PropTypes.bool,
    tags: PropTypes.object
  };

  static navigationOptions = ({ navigation }) => {
    const { routeName } = navigation.state;
    const tab = get(navigation, 'state.params.tab', null);
    const disabled = routeName === 'discoverTag' && tab > 0;
    const isLocked = tab > 0;
    return {
      gesturesEnabled: !disabled,
      drawerLockMode: isLocked ? 'locked-closed' : 'unlocked'
    };
  };

  tabView = React.createRef();
  header = React.createRef();
  position = new Animated.Value(0);

  constructor(props, context) {
    super(props, context);
    this.state = {
      index: 0,
      routes: [{ key: 'new', title: 'New' }, { key: 'top', title: 'Top' }],
      headerHeight: 50
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderBadge = this.renderBadge.bind(this);

    const { params } = this.props.navigation.state;
    if (params && params.topic) {
      this.topicId = params.id;
      this.state.routes = [{ key: 'new', title: 'New' }, { key: 'top', title: 'Top' }];
    }
    this.loaded = false;
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { index } = this.state;
    if (this.topicId) {
      this.needsReload = new Date().getTime();
      requestAnimationFrame(() => {
        this.loaded = true;
        this.setState({});
      });
    } else {
      this.loaded = true;
    }
    navigation.setParams({ tab: index });
  }

  componentDidUpdate(prev, prevState) {
    const { navigation, tabId, actions } = this.props;
    const newSortUrlParam = get(navigation, 'state.params.sort');
    const oldSortUrlParam = get(prev.navigation, 'state.params.sort');

    if (newSortUrlParam && newSortUrlParam !== oldSortUrlParam) {
      console.log('change sort', navigation.state.params);
      // tabId = this.state.routes.findIndex(r => r.key === newSortUrlParam);
    }
    if (tabId > -1 && tabId !== prev.tabId && tabId !== this.state.index) {
      this.setState({ index: tabId });
    }

    const { index } = this.state;
    const prevIndex = prevState.index;

    if (index !== prevIndex) {
      const isActive = index !== 0;
      this.header.current.showHeader();
    }
  }

  onScroll = event => this.header.current.onScroll(event);

  setPostTop = height => this.setState({ headerHeight: height });

  handleChangeTab = index => {
    const { actions, navigation } = this.props;
    this.setState({ index });
    actions.setScrollTab('discover', { tab: index });
    navigation.setParams({ tab: index });
  };

  renderScene({ route }) {
    const { index, headerHeight } = this.state;
    const { navigation } = this.props;
    const currentRoute = this.state.routes[index] || {};
    if (!this.loaded) return <View key={route.key} />;
    switch (route.key) {
      case 'feed':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'twitterFeed'}
            key={'twitterFeed'}
            navigation={navigation}
            onScroll={this.onScroll}
            offsetY={headerHeight}
            tabLabel={route.title}
          />
        );

      case 'new':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'new'}
            key={'new'}
            navigation={navigation}
            onScroll={this.onScroll}
            offsetY={headerHeight}
            tabLabel={route.title}
          />
        );
      case 'top':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'top'}
            key={'top'}
            navigation={navigation}
            onScroll={this.onScroll}
            offsetY={headerHeight}
            tabLabel={route.title}
          />
        );
      case 'people':
        return (
          <Discover
            active={currentRoute.key === route.key}
            type={'people'}
            key={'people'}
            navigation={navigation}
            onScroll={this.onScroll}
            offsetY={headerHeight}
            tabLabel={route.title}
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
    return (
      <DiscoverHeader ref={this.header} setPostTop={this.setPostTop}>
        <TabBar setTab={index => this.setState({ index })} {...props} />
      </DiscoverHeader>
    );
  }

  render() {
    const { index } = this.state;
    const { actions, gesture } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <TabViewContext.Provider value={this.tabView}>
          <DrawerGestureContext.Consumer>
            {ref => (
              <View style={{ flex: 1 }}>
                <TabView
                  gestureHandlerProps={{
                    ref: this.tabView,
                    simultaneousHandlers: [ref, gesture || {}],
                    waitFor: [gesture || {}]
                  }}
                  renderTabBar={props => this.renderHeader(props)}
                  position={this.position}
                  navigationState={this.state}
                  renderScene={this.renderScene}
                  onIndexChange={this.handleChangeTab}
                  initialLayout={{ width: Dimensions.get('window').width }}
                />
              </View>
            )}
          </DrawerGestureContext.Consumer>
        </TabViewContext.Provider>
      </View>
    );
  }
}

// function PositionListener({ position, tabView, drawer }) {
//   const dispatch = useDispatch();
//   const g = useSelector(state => state.navigation.gestures);
//   const tabViewGesture = useSelector(state => state.navigation.gestures.tabView);
//   const active = tabViewGesture && tabViewGesture.active;
//   return (
//     <React.Fragment>
//       <Animated.Code
//         exec={Animated.onChange(
//           position,
//           Animated.call([position], ([value]) => {
//             const isActive = value > 0.0001;
//             // drawer.current.props.enabled = isActive;
//             dispatch(
//               registerGesture({ name: 'tabView', active: isActive, gesture: tabView })
//             );
//           })
//         )}
//       />
//     </React.Fragment>
//   );
// }

const localStyles = StyleSheet.create({
  container: {
    flex: 1
  }
});

styles = { ...globalStyles, ...localStyles };

function mapStateToProps(state) {
  return {
    tags: state.tags,
    tabId: state.navigation.discover.tab,
    topics: state.navigation.showTopics,
    feedUnread: state.posts.feedUnread,
    gesture: state.navigation.gesture
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getParentTags,
        goToTopic,
        setScrollTab,
        goToPage,
        lockDrawer
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscoverTabs);
