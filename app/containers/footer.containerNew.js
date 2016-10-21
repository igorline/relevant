import React, { Component } from 'react';
import {
  TabBarIOS,
  StyleSheet
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';

import CardContainer from './card.container';

let styles;

class Tabs extends Component {

  changeTab(i) {
    this.props.actions.changeTab(i);
  }

  renderTabContent(key) {
    return <CardContainer {...this.props} defaultContainer={key} />;
  }

  render() {
    const tabs = this.props.tabs.routes.map((tab, i) => (
      <TabBarIOS.Item
        key={tab.key}
        title={tab.icon}
        onPress={() => this.changeTab(i)}
        selected={this.props.tabs.index === i}
      >
        {this.renderTabContent(tab.key)}
      </TabBarIOS.Item>
      )
    );
    return (
      <TabBarIOS tintColor="red">
        {tabs}
      </TabBarIOS>
    );
  }
}

const localStyles = StyleSheet.create({
  back: {
    position: 'absolute',
    top: 0,
    left: 5,
    height: 60,
    padding: 12,
    flex: 1,
    justifyContent: 'flex-end'
  },
  backInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backImg: {
    height: 10,
    width: 7,
    backgroundColor: 'transparent',
    marginRight: 4
  },
  backText: {
    color: '#aaaaaa',
    fontSize: 12
  },
  gear: {
    height: 45,
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
  gearImg: {
    height: 20,
    width: 20
  },
  nav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.25)'
  },
  stats: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  statsTxt: {
    color: 'black',
    fontSize: 10
  },
  navItem: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    backgroundColor: 'transparent',
    fontSize: 15,
    textAlign: 'center',
  },
});

styles = { ...localStyles, ...globalStyles };


function mapStateToProps(state) {
  return {
    tabs: state.tabs,
    navigation: state.navigation
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

