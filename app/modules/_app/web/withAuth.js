import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';

const withAuth = (Component, role) => {
  const AuthComponent = props => {
    let { authenticated } = props;
    if (role && props.user) {
      if (role !== props.user.role) authenticated = false;
    }
    return authenticated ? (
      <Component {...props} />
    ) : (
      <Redirect to={{ pathname: '/', state: { from: props.location } }} />
    );
  };

  AuthComponent.propTypes = {
    location: PropTypes.object.isRequired,
    authenticated: PropTypes.bool.isRequired,
    user: PropTypes.object
  };

  return withRouter(
    connect(state => ({
      authenticated: state.auth.isAuthenticated,
      user: state.auth.user
    }))(AuthComponent)
  );
};

export default withAuth;
