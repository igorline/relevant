import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as authActions from 'modules/auth/auth.actions';
import * as queryString from 'query-string';
import Modal from 'modules/ui/web/modal';
import LoginForm from './login';
import SignupForm from './signup';
import ConfirmEmail from './confirmEmail.component';
import Forgot from './forgot.component';
import ResetPassword from './resetPassword.component';

let styles;

if (process.env.BROWSER === true) {
  require('./auth.css');
}

class AuthContainer extends Component {
  static propTypes = {
    auth: PropTypes.object,
    location: PropTypes.object,
    modal: PropTypes.bool,
    actions: PropTypes.object,
    dispatch: PropTypes.func,
    toggleLogin: PropTypes.func,
    user: PropTypes.object,
    open: PropTypes.bool,
    route: PropTypes.object,
    history: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.authNav = this.authNav.bind(this);
    this.close = this.close.bind(this);

    const defaultRoute = '/' + this.props.auth.community + '/new';

    const { redirect } = queryString.parse(this.props.location.search);
    const redirectRoute = redirect || defaultRoute;

    this.state = {
      redirectTo: redirectRoute,
      type: 'login'
    };
  }

  componentWillReceiveProps(next) {
    if (this.props.modal) return;
    const { redirect } = queryString.parse(this.props.location.search);
    const redirectTo = redirect;
    if (!this.props.auth.user && next.auth.user && redirectTo) {
      this.props.history.push(redirectTo);
    }
  }

  async login(data) {
    try {
      const user = {
        name: data.username,
        password: data.password
      };
      const loggedIn = await this.props.actions.loginUser(user);
      if (loggedIn) this.close();
    } catch (err) {
      // TODO error handling
    }
  }

  authNav(type) {
    if (this.props.modal) {
      this.setState({ type });
    } else this.props.history.push('/user/' + type);
  }

  async signup(data) {
    try {
      const user = {
        name: data.username,
        email: data.email,
        password: data.password
      };
      const signedUp = await this.props.actions.createUser(user);
      if (signedUp) this.close();
    } catch (err) {
      // TODO error handling
    }
  }

  logout() {
    this.props.actions.logoutAction();
  }

  sendMessage() {
    this.props.dispatch(this.props.actions.hello);
  }

  close() {
    this.authNav('login');
    if (this.props.toggleLogin) {
      this.props.toggleLogin();
    } else {
      this.props.history.push(this.state.redirectTo);
    }
  }

  render() {
    const { user, route } = this.props;
    let confirm;
    let auth;
    let visible = true;

    let path = this.props.modal ? this.state.type : route.path;
    // route.path;

    if (this.props.user && this.props.user.role === 'temp') {
      path = 'signup';
      confirm = true;
    }
    if (this.props.modal) {
      visible = this.props.open;
    }

    let title = '';

    if (path === 'confirm/:user/:code') {
      confirm = true;
      auth = <ConfirmEmail authNav={this.authNav} {...this.props} />;
      title = 'Confirm Your Email';
    } else if (path === 'forgot') {
      auth = <Forgot authNav={this.authNav} {...this.props} />;
      title = 'Recover Password';
      // } else if (isAuthenticated) {
      //   auth = <button onClick={() => this.logout()}>logout</button>;
    } else if (path === 'login') {
      auth = <LoginForm authNav={this.authNav} parentFunction={this.login} {...this.props} />;
      title = 'Sign In';
    } else if (path === 'signup') {
      auth = <SignupForm authNav={this.authNav} parentFunction={this.signup} {...this.props} />;
      title = 'Sign Up';
    } else if (path === 'resetPassword/:token') {
      auth = <ResetPassword authNav={this.authNav} {...this.props} />;
      title = 'Reset Password';
    }

    return (
      <Modal visible={visible} close={this.close.bind(this)} title={title}>
        <div className="authContainer" style={styles.authContainer}>
          {user && !confirm ? (
            <div className="authStatus">You are logged in as @{user.handle}</div>
          ) : (
            ''
          )}
          {auth}
        </div>
      </Modal>
    );
  }
}

styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '20px',
    paddingTop: '20px'
  }
};

const mapStateToProps = state => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message,
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...authActions,
    },
    dispatch
  )
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthContainer));
