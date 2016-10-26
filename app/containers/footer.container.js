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

  changeTab(i) {
    //if (i === 4) this.props.actions.setSelectedUser(this.props.auth.user._id);
    this.props.actions.changeTab(i);
  }

  renderTabContent(key) {
    return (<CardContainer
      style={{ flex: 1 }}
      defaultContainer={key}
      showActionSheet={this.props.showActionSheet}
    />);
  }

  render() {
    const tabs = this.props.tabs.routes.map((tab, i) => {
      let badge;
      let icon = tab.icon;
      if (tab.key === 'activity') badge = this.props.notif.count;
      return (
        <TabBarIOS.Item
          key={tab.key}
          style={{ paddingBottom: 49 }}
          title={tab.icon}
          tintColor={'blue'}
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
        translucent
      >
        {tabs}
      </TabBarIOS>
    );
  }
}

function mapStateToProps(state) {
  return {
    tabs: state.tabs,
    auth: state.auth,
    notif: state.notif,
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

