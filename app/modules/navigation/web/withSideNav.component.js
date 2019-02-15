import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import { connect } from 'react-redux';
import SideNav from 'modules/navigation/web/sideNav.component';
import { withRouter } from 'react-router-dom';
import { colors } from 'app/styles';
import { View } from 'modules/styled/uni';
import SplashComponent from 'modules/web_splash/splash.component';

const Signup = () => (
  <div className="signupCTA">
    <Link to="/user/login">
      <Button mr={4}>Login</Button>
    </Link>
    <Link to="/user/signup">
      <Button>Sign Up</Button>
    </Link>
  </div>
);

const WithSideNav = props => {
  const { isAuthenticated } = props;
  return (
    <View bg={colors.white} display="flex" flex={1}>
      {!isAuthenticated ? <SplashComponent type={'app'} cta={Signup} /> : null}
      <View fdirection="row" display="flex">
        <View fdirection="column" display="flex">
          <SideNav {...props} />
        </View>
        <View display="flex" flex={1}>
          {renderRoutes(props.route.routes)}
        </View>
      </View>
    </View>
  );
};

WithSideNav.propTypes = {
  route: PropTypes.object,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default withRouter(connect(mapStateToProps)(WithSideNav));
