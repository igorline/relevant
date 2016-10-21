import React, { Component } from 'react';
import {
  TabBarIOS,
  StyleSheet,
  View
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';

import CardContainer from './card.container';

let styles;

class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.showActionSheet = this.props.showActionSheet.bind(this);
  }

  changeTab(i) {
    this.props.actions.changeTab(i);
  }

  renderTabContent(key) {
    return <CardContainer
      defaultContainer={key}
      showActionSheet={this.props.showActionSheet}
    />;
  }

  render() {
    const tabs = this.props.tabs.routes.map((tab, i) => {
      let badge;
      let icon = tab.icon;
      if (tab.key === 'activity') badge = this.props.notif.count;
      // if (tab.key === 'profile' && this.props.auth.user.image) {
      //    icon = { uri: this.props.auth.user.image };
      // }
      return (
        <TabBarIOS.Item
          key={tab.key}
          icon={icon}
          title={tab.icon}
          onPress={() => this.changeTab(i)}
          selected={this.props.tabs.index === i}
          badge={badge}
        >
          {this.renderTabContent(tab.key)}
        </TabBarIOS.Item>
      );
    });
    return (
      <TabBarIOS
        tintColor="black"
        translucent
      >
        {tabs}
      </TabBarIOS>
    );
  }
}

const localStyles = StyleSheet.create({
})

styles = { ...localStyles, ...globalStyles };

// export default Tabs;

function mapStateToProps(state) {
  return {
    tabs: state.tabs,
    auth: state.auth,
    notif: state.notif,
    // navigation: state.navigation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);

