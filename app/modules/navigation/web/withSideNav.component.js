import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { colors, layout } from 'app/styles';
import { View } from 'modules/styled/uni';
import BannerPrompt from 'modules/bannerPrompt/banner.container';
import SplashComponent from 'modules/navigation/banner';
import { slide as Menu } from 'react-burger-menu';
import {
  openWebSideNav,
  closeWebSideNav,
  hideModal
} from 'modules/navigation/navigation.actions';
import { bindActionCreators } from 'redux';
import { getCommunities } from 'modules/community/community.actions';

class WithSideNav extends Component {
  static propTypes = {
    route: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    notif: PropTypes.object,
    actions: PropTypes.object,
    communities: PropTypes.array,
    sideNavIsOpen: PropTypes.bool,
    screenSize: PropTypes.number
  };

  isMenuOpen = state => {
    if (state.isOpen) {
      this.props.actions.openWebSideNav();
    } else {
      this.props.actions.closeWebSideNav();
    }
    return state.isOpen;
  };

  static fetchData(dispatch) {
    return dispatch(getCommunities());
  }

  componentDidMount() {
    const { actions, communities } = this.props;
    if (!communities.length) actions.getCommunities();
  }

  render() {
    const { isAuthenticated, sideNavIsOpen, screenSize, notif, route } = this.props;
    const { promptType } = notif;
    const isDesktop = screenSize === 0;

    return (
      <View bg={colors.white} display="flex" flex={1}>
        {!isAuthenticated ? (
          <SplashComponent screenSize={screenSize} type={'app'} cta="SIGN_UP" />
        ) : null}
        {promptType ? (
          <View
            position="sticky"
            zIndex="200"
            style={{
              top: 0,
              right: 0,
              left: 0,
              minHeight: layout.BANNER_PROMPT_HEIGHT
            }}
          >
            <BannerPrompt />
          </View>
        ) : null}
        <View fdirection="row" display="flex">
          {!isDesktop ? (
            <Menu
              width={layout.sideNavWidth}
              isOpen={sideNavIsOpen}
              onStateChange={this.isMenuOpen}
            >
              <View
                fdirection="column"
                display="flex"
                style={{ top: promptType ? layout.BANNER_PROMPT_HEIGHT : 0 }}
              >
                <SideNav />
              </View>
            </Menu>
          ) : (
            <View fdirection="column" display="flex">
              <SideNav />
            </View>
          )}
          <View display="flex" flex={1}>
            {renderRoutes(route.routes)}
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  communities: state.community.list,
  isAuthenticated: state.auth.isAuthenticated,
  navigation: state.navigation,
  sideNavIsOpen: state.navigation.sideNavIsOpen,
  screenSize: state.navigation.screenSize,
  notif: state.notif
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      openWebSideNav,
      closeWebSideNav,
      hideModal,
      getCommunities
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
