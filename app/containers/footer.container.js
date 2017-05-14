import React, { Component } from 'react';
import {
  TabBarIOS,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from '../actions/navigation.actions';
import CardContainer from './tabView.container';
import * as userActions from '../actions/user.actions';
import Footer from './footerCustom.container';
import { fullHeight } from '../styles/global';

class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.showActionSheet = this.props.showActionSheet.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.tabs = {};
  }

  changeTab(key) {
    let tab = this.props.navigation.tabs.routes[this.props.navigation.tabs.index];
    this.props.actions.toggleTopics(false);

    // This is if we want to make create post a separate scene
    if (key === 'createPost') {
      this.props.actions.push({
        key,
        back: true,
        title: 'New Post',
        next: 'Post',
        direction: 'vertical',
        // ownCard: true
      }, 'home');
    } else {
      if (tab.key === key) {
        if (this.props.navigation[key].routes.length === 1) {
          this.props.actions.refreshTab(key);
        }

        if (key === 'discover') {
          let index = this.props.navigation[key].index;
          let route = this.props.navigation[key].routes[index];
          if (route.component === 'discover') {
            this.props.actions.refreshTab(key);
          } else {
            this.props.actions.resetRoutes();
          }
        } else {
          this.props.actions.resetRoutes();
        }
      }

      if (key === 'activity' && this.props.notif.count) {
        this.props.actions.reloadTab(key);
      }
      if (key === 'read' && this.props.feedUnread) {
        this.props.actions.reloadTab(key);
      }
      if (this.props.navigation.reload > this.props.navigation[key].reload) {
        this.props.actions.reloadTab(key);
      }

      this.props.actions.changeTab(key);
    }
    this.forceUpdate();
  }

  initNavView(key) {
    let Card = require('./tabView.container').default;
    let tabView = (<Card
      style={{ flex: 1 }}
      defaultContainer={key}
      key={key}
      showActionSheet={this.props.showActionSheet}
    />);
    this.tabs[key] = { key, view: tabView };
    return tabView;
  }

  renderTabContent(key) {
    if (!this.tabs[key]) this.initNavView(key);
    return Object.keys(this.tabs).map(k => {
      let tab = this.tabs[k];
      let active = tab.key === key;
      return (
        <View
          key={tab.key}
          style={[
            { overflow: 'hidden', top: 0, left: 0 },
            active ? { flex: 1 } : { height: 0 }
          ]}
        >
          {tab.view}
        </View>
      );
    });

    // return (<CardContainer
    //   style={{ flex: 1 }}
    //   defaultContainer={key}
    //   showActionSheet={this.props.showActionSheet}
    // />);
  }

  render() {
    const tabs = this.props.navigation.tabs.routes.map((tab, i) => {
    // const tabs = this.props.tabs.routes.map((tab, i) => {
      let badge;
      let icon = tab.icon;
      if (tab.key === 'activity' && this.props.notif.count) badge = this.props.notif.count;
      if (tab.key === 'read' && this.props.feedUnread) badge = this.props.feedUnread;
      if (tab.key === 'auth') return null;
      return (
        <TabBarIOS.Item
          renderAsOriginal
          key={tab.key}
          icon={tab.regIcon}
          title={tab.title}
          tintColor={'#4d4eff'}
          style={[{ paddingBottom: 48 }]}
          onPress={() => this.changeTab(tab.key)}
          selected={this.props.navigation.tabs.index === i}
          badge={badge}
        >
          {this.renderTabContent(tab.key)}
        </TabBarIOS.Item>
      );
    });

        // <TabBarIOS
        //   translucent={false}
        //   style={{ backgroundColor: 'white', borderTopColor: '#242425' }}
        //   // unselectedTintColor={'#231f20'}
        //   tintColor={'#4d4eff'}
        // >
        //   {tabs}
        // </TabBarIOS>

    let tab = this.props.navigation.tabs.routes[this.props.navigation.tabs.index];
    console.log(tab.key);

    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: fullHeight - 50 }}>
          {tab ? this.renderTabContent(tab.key) : null}
        </View>
        <Footer {...this.props} changeTab={this.changeTab} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    navigation: state.navigation,
    feedUnread: state.posts.feedUnread
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
        ...userActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);

