import React, { Component } from 'react';
import {
  TabBarIOS,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';
import * as authActions from '../actions/auth.actions';
import * as messageActions from '../actions/message.actions';
import * as animationActions from '../actions/animation.actions';
import * as notifActions from '../actions/notif.actions';
import * as userActions from '../actions/user.actions';
import CardContainer from './card.container';


const localStyles = StyleSheet.create({
});

let styles = { ...localStyles, ...globalStyles };

class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.showActionSheet = this.props.showActionSheet.bind(this);
  }

  changeTab(i) {
    this.props.actions.changeTab(i);
  }

  renderTabContent(key) {
    return (<CardContainer
      defaultContainer={key}
      showActionSheet={this.props.showActionSheet}
    />);
  }

  render() {

    const tabs = this.props.tabs.routes.map((tab, i) => {
      let badge;
      let icon = tab.icon;
      //console.log(this.props.tabs.index, i, 'match?');
      if (tab.key === 'activity') badge = this.props.notif.count;
      // if (tab.key === 'profile' && this.props.auth.user.image) {
      //    icon = { uri: this.props.auth.user.image };
      // }
      return (
        <TabBarIOS.Item
          key={tab.key}
          icon={'💜'}
          style={{fontSize: 20}}
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
        style={{ fontSize: 20 }}
        itemPositioning={'center'}
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
    actions: bindActionCreators({
      ...authActions,
      ...notifActions,
      ...messageActions,
      ...userActions,
      ...animationActions,
      ...navigationActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);

