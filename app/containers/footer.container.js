import React, { Component } from 'react';
import {
  TabBarIOS,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';
import CardContainer from './card.container';
import * as userActions from '../actions/user.actions';

const localStyles = StyleSheet.create({
});

let styles = { ...localStyles, ...globalStyles };

class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.showActionSheet = this.props.showActionSheet.bind(this);
  }

  changeTab(key) {

    // This is if we want to make create post a separate scene
    // if (key === 'createPost') {
    //   this.props.actions.push({
    //     key,
    //     back: true,
    //     title: 'Create Post'
    //   }, 'home');
    // } else

    this.props.actions.resetRoutes();
    this.props.actions.changeTab(key);
  }

  renderTabContent(key) {
    return (<CardContainer
      style={{ flex: 1 }}
      defaultContainer={key}
      showActionSheet={this.props.showActionSheet}
    />);
  }

  render() {
    const tabs = this.props.navigation.tabs.routes.map((tab, i) => {
    // const tabs = this.props.tabs.routes.map((tab, i) => {
      let badge;
      let icon = tab.icon;
      if (tab.key === 'activity' && this.props.notif.count) badge = this.props.notif.count;
      if (tab.key === 'auth') return null;
      return (
        <TabBarIOS.Item
          renderAsOriginal
          key={tab.key}
          icon={tab.regIcon}
          renderAsOriginal
          title={tab.title}
          tintColor={'#5C00FF'}
          style={{ paddingBottom: 48 }}
          onPress={() => this.changeTab(tab.key)}
          selected={this.props.navigation.tabs.index === i}
          badge={badge}
        >
          {this.renderTabContent(tab.key)}
        </TabBarIOS.Item>
      );
    });
    return (
      <TabBarIOS
        translucent
      >
        {tabs}
      </TabBarIOS>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    navigation: state.navigation
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

