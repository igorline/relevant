import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as navigationActions from 'modules/navigation/navigation.actions';
import * as userActions from 'modules/user/user.actions';
import TabBar from './tabBar.component';

class TabBarContainer extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object,
    actions: PropTypes.object,
    notif: PropTypes.object,
    reducerNav: PropTypes.object,
    user: PropTypes.object
  };

  changeTab = key => {
    const { actions, navigation, reducerNav, notif } = this.props;
    const tab = navigation.state.routes[this.props.navigation.state.index];

    // Triggers route in the main router
    if (key === 'createPostTab') {
      return navigation.navigate({
        routeName: 'createPost',
        params: { left: 'Cancel', title: 'New Post', next: 'Next' }
      });
    }

    // Global reload of tabs
    if (reducerNav.reload > reducerNav[key].reload) actions.reloadTab(key);
    if (key === 'activity' && notif.count) actions.reloadTab(key);

    if (tab.key === key) {
      if (tab.routes.length === 1) return actions.refreshTab(key);

      if (key === 'discover') {
        const route = tab.routes[tab.index];
        if (route.params.key === 'discoverTag') return actions.refreshTab(key);
      }
      navigation.popToTop();
    }

    return navigation.navigate(key);
  };

  render() {
    const { navigation, user, notif } = this.props;
    const currentTab = navigation.state
      ? navigation.state.routes[navigation.state.index]
      : null;
    const tabs = navigation.state.routes;

    return (
      <TabBar
        tabs={tabs}
        user={user}
        notif={notif}
        currentTab={currentTab}
        changeTab={this.changeTab}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
    notif: state.notif,
    reducerNav: state.navigation
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
