import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { colors, layout } from 'app/styles';
import { View } from 'modules/styled/uni';
import SplashComponent from 'modules/web_splash/splash.component';
import { slide as Menu } from 'react-burger-menu';

const WithSideNav = props => {
  const { isAuthenticated, navigation } = props;
  const smallWidth = navigation.width <= layout.mediumScreenWidth;
  const { sideNavIsOpen } = navigation;
  return (
    <View bg={colors.white} display="flex" flex={1}>
      {!isAuthenticated && !smallWidth ? (
        <SplashComponent type={'app'} cta="SIGN_UP" />
      ) : null}
      <View fdirection="row" display="flex">
        {smallWidth ? (
          <Menu width={layout.sideNavWidth} isOpen={sideNavIsOpen}>
            <View fdirection="column" display="flex">
              <SideNav {...props} />
            </View>
          </Menu>
        ) : (
          <View fdirection="column" display="flex">
            <SideNav {...props} />
          </View>
        )}
        <View display="flex" flex={1}>
          {renderRoutes(props.route.routes)}
        </View>
      </View>
    </View>
  );
};

WithSideNav.propTypes = {
  route: PropTypes.object,
  isAuthenticated: PropTypes.bool,
  navigation: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  navigation: state.navigation
});

export default withRouter(connect(mapStateToProps)(WithSideNav));
