import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../../../actions/auth.actions';
import * as socketActions from '../../actions/socket';
import LoginForm from "./login";
import SignupForm from "./signup";

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

  login(data) {
    let user = {
      name: data.username,
      password: data.password
    };
    this.state.redirectTo = this.props.location.query.redirect || '/login';
    this.props.actions.loginUser(user, this.state.redirectTo);
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
    this.props.actions.logout();
  }

  sendMessage() {
    this.props.dispatch(this.props.actions.hello);
  }

  render() {
    const { isAuthenticated, user, route } = this.props;
    let auth;

    if (isAuthenticated) {
      auth = <button onClick={() => this.logout()}>logout</button>;
    } else if (route.path === 'login') {
      auth = <LoginForm parentFunction={this.login} />;
    } else if (route.path === 'signup') {
      auth = <SignupForm parentFunction={this.signup} />;
    }

    return (
      <div className="authContainer">
        {this.props.user ? <div className="userInfo"> Logged in as {this.props.user.name}</div> : ''}
        {auth}
        {this.props.statusText ? <div className="alert alert-info">{this.props.statusText}</div> : ''}
        <br/>
        <a href="/auth/facebook">Log in with facebook</a>
        {' '}
        <a href="/auth/twitter">Log in with twitter</a>
        <button onClick={() => this.sendMessage()}>Send Message</button>
        <div>{this.props.message}</div>
      </div>
    );
  }
}

// reactMixin(Login.prototype, LinkedStateMixin);

const mapStateToProps = (state) => ({
  isAuthenticating: state.auth.isAuthenticating,
  isAuthenticated: state.auth.isAuthenticated,
  statusText: state.auth.statusText,
  user: state.auth.user,
  message: state.socket.message
});

const mapDispatchToProps = (dispatch) => ( Object.assign({}, { dispatch }, {
  actions: bindActionCreators(Object.assign({}, actionCreators, socketActions), dispatch)
}));

export default connect(mapStateToProps, mapDispatchToProps)(Login);
