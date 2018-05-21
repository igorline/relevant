import React, { Component } from 'react';
import {
  View,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from '../../actions/navigation.actions';
import CardContainer from './tabView.container';
import * as userActions from '../../actions/user.actions';
import Footer from './footer.component';
import { IphoneX } from '../../styles/global';


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
      // if (this.props.auth.user.balance < 1) {
      //   return Alert.alert('You need to have at least one coin to post');
      // }
      this.props.actions.push({
        key: 'createPost',
        back: true,
        title: 'New Post',
        next: 'Post',
        direction: 'vertical',
      }, 'home');

      // need to to do this because the navigator renderer
      // is using this object to display info above and to render transition
      this.props.actions.replaceRoute({
        key: 'createPost',
        component: 'createPost',
        back: true,
        left: 'Cancel',
        title: 'New Post',
        next: 'Next',
        direction: 'vertical'
      }, 0, 'createPost');

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
    return null;
  }

  initNavView(key) {
    let tabView = (<CardContainer
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
      let margin = IphoneX ? 83 : 50;
      return (
        <View
          key={tab.key}
          style={[
            active ? { flex: 1, marginBottom: margin } : { flex: 0 }
          ]}
        >
          <CardContainer
            defaultContainer={tab.key}
            active={active}
            key={tab.key}
            showActionSheet={this.props.showActionSheet}
          />
        </View>
      );
    });
  }

  render() {
    let tab = this.props.navigation.tabs.routes[this.props.navigation.tabs.index];

    return (
      <View style={{ flex: 1 }}>
        {tab ? this.renderTabContent(tab.key) : null}
        <Footer {...this.props} changeTab={this.changeTab} />
      </View>
    );
  }
}

Tabs.propTypes = {
  showActionSheet: PropTypes.func,
  actions: PropTypes.object,
  auth: PropTypes.object,
  navigation: PropTypes.object,
  notif: PropTypes.object,
  feedUnread: PropTypes.number
};

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

