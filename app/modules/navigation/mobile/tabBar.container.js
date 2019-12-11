import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as userActions from 'modules/user/user.actions';
import TabBar from './tabBar.component';

class TabBarContainer extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    notif: PropTypes.object,
    reducerNav: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.changeTab = this.changeTab.bind(this);
    this.tabs = {};
  }

  changeTab(key) {
    const { actions, navigation, reducerNav, notif } = this.props;
    const tab = navigation.state.routes[this.props.navigation.state.index];
    actions.toggleTopics(false);
    actions.registerGesture({
      name: 'tabView',
      active: false
    });

    // Triggers route in the main router
    if (key === 'createPostTab') {
      return navigation.navigate({
        routeName: 'createPost',
        params: { left: 'Cancel', title: 'New Post', next: 'Next' }
      });
    }

    if (reducerNav.reload > reducerNav[key].reload) {
      actions.reloadTab(key);
    }

    if (tab.key === key) {
      if (tab.routes.length === 1) {
        return actions.refreshTab(key);
      }

      if (key === 'discover') {
        const { index } = tab;
        const route = tab.routes[index];
        if (route.params.key === 'discoverTag') {
          actions.refreshTab(key);
        } else {
          navigation.popToTop();
        }
      } else {
        navigation.popToTop();
      }
    }

    if (key === 'activity' && notif.count) {
      actions.reloadTab(key);
    }

    return navigation.navigate(key);
  }

  render() {
    return <TabBar {...this.props} changeTab={this.changeTab} />;
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    notif: state.notif,
    reducerNav: state.navigation,
    feedUnread: state.posts.feedUnread
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...navigationActions,
        ...userActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TabBarContainer);
