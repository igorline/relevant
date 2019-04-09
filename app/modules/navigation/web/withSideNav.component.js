import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { colors, layout, sizing } from 'app/styles';
import { View } from 'modules/styled/uni';
import TopBarNotification from 'modules/navigation/topBarNotification.component';
import SplashComponent from 'modules/web_splash/splash.component';
import { slide as Menu } from 'react-burger-menu';
import { showDesktopNotificationPrompt } from 'modules/activity/activity.actions';
import { openWebSideNav, closeWebSideNav } from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';

class WithSideNav extends Component {
  isMenuOpen = state => {
    if (state.isOpen) {
      this.props.actions.openWebSideNav();
    } else {
      this.props.actions.closeWebSideNav();
    }
    return state.isOpen;
  };
  render() {
    const { isAuthenticated, navigation, notif } = this.props;
    const smallWidth = navigation.width <= layout.mediumScreenWidth;
    const { sideNavIsOpen } = navigation;
    const { notification } = notif;
    return (
      <View bg={colors.white} display="flex" flex={1}>
        {!isAuthenticated && !smallWidth ? (
          <SplashComponent type={'app'} cta="SIGN_UP" />
        ) : null}
        {notification ? (
          <View
            position="fixed"
            zIndex="200"
            style={{
              right: 0,
              left: 0,
              minHeight: sizing(5)
            }}
          >
            <TopBarNotification />
          </View>
        ) : null}
        <View fdirection="row" display="flex">
          {smallWidth ? (
            <Menu
              width={layout.sideNavWidth}
              isOpen={sideNavIsOpen}
              onStateChange={this.isMenuOpen}
            >
              <View fdirection="column" display="flex" style={{ top: 0 }}>
                <SideNav {...this.props} />
              </View>
            </Menu>
          ) : (
            <View fdirection="column" display="flex">
              <SideNav {...this.props} />
            </View>
          )}
          <View display="flex" flex={1}>
            {renderRoutes(this.props.route.routes)}
          </View>
        </View>
      </View>
    );
  }
}

WithSideNav.propTypes = {
  route: PropTypes.object,
  isAuthenticated: PropTypes.bool,
  navigation: PropTypes.object,
  notif: PropTypes.object,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  navigation: state.navigation,
  notif: state.notif
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      openWebSideNav,
      closeWebSideNav,
      showDesktopNotificationPrompt
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithSideNav)
);
