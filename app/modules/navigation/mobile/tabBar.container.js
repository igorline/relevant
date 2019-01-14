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
    reducerNav: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.changeTab = this.changeTab.bind(this);
    this.tabs = {};
  }

  changeTab(key) {
    const tab = this.props.navigation.state.routes[this.props.navigation.state.index];
    this.props.actions.toggleTopics(false);

    // Triggers route in the main router
    if (key === 'createPostTab') {
      return this.props.navigation.navigate({
        routeName: 'createPost',
        params: { left: 'Cancel', title: 'New Post', next: 'Next' }
      });
    }

    if (this.props.reducerNav.reload > this.props.reducerNav[key].reload) {
      this.props.actions.reloadTab(key);
    }

    if (tab.key === key) {
      if (tab.routes.length === 1) {
        return this.props.actions.refreshTab(key);
      }

      if (key === 'discover') {
        const { index } = tab;
        const route = tab.routes[index];
        if (route.params.key === 'discoverTag') {
          this.props.actions.refreshTab(key);
        } else {
          this.props.navigation.popToTop();
        }
      } else {
        this.props.navigation.popToTop();
      }
    }

    if (key === 'activity' && this.props.notif.count) {
      this.props.actions.reloadTab(key);
    }

    return this.props.navigation.navigate(key);
  }

  render() {
    return (
      <TabBar {...this.props} changeTab={this.changeTab} />
    );
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
