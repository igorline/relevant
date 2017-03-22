import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as authActions from '../../../actions/auth.actions';
import * as socketActions from '../../actions/socket';
import * as routerActions from 'react-router-redux';
import LoginForm from './login';
import SignupForm from './signup';
import ConfirmEmail from './confirmEmail.component';
import Forgot from './forgot.component';
import ResetPassword from './resetPassword.component';

let styles;

export class Login extends Component {

  constructor(props) {
    super(props);
    const redirectRoute = this.props.location.query.redirect || '/login';
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.state = {
      redirectTo: redirectRoute
    };
  }

  componentWillReceiveProps(next) {
    let redirectTo = this.props.location.query.redirect;
    if (!this.props.auth.user && next.auth.user && redirectTo) {
      this.props.actions.push(redirectTo);
    }
  }

  login(data) {
    let user = {
      name: data.username,
      password: data.password
    };
    this.props.actions.loginUser(user);
  }

  signup(data) {
    let user = {
      name: data.username,
      email: data.email,
      password: data.password
    };
    this.props.actions.createUser(user, this.state.redirectTo);
  }

  logout() {
    this.props.actions.logoutAction();
  }

  sendMessage() {
    this.props.dispatch(this.props.actions.hello);
  }

  render() {
    const { isAuthenticated, user, route, statusText } = this.props;
    let auth;
    let confirm;

    if (route.path === 'confirm/:user/:code') {
      confirm = true;
      auth = <ConfirmEmail {...this.props} />;
    } else if (route.path === 'forgot') {
      auth = <Forgot {...this.props} />;
    } else if (isAuthenticated) {
      auth = <button onClick={() => this.logout()}>logout</button>;
    } else if (route.path === 'login') {
      auth = <LoginForm parentFunction={this.login} />;
    } else if (route.path === 'signup') {
      auth = <SignupForm parentFunction={this.signup} />;
    } else if (route.path === 'resetPassword/:token') {
      auth = <ResetPassword {...this.props} />;
    }

    return (
      <div className="authContainer" style={styles.authContainer}>
        {user && !confirm ? <div className="userInfo"> Logged in as {user.name}</div> : ''}
        {auth}
        {statusText ? <div className="alert alert-info">{statusText}</div> : ''}
      </div>
    );
  }
}

styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '100px',
    fontSize: '20px'
  }
};

const mapStateToProps = (state) => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message,
  auth: state.auth
});

const mapDispatchToProps = (dispatch) => ( Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, authActions, socketActions, routerActions), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Login);
