import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShadowButton from 'modules/ui/web/ShadowButton';
import { browserAlerts } from 'app/utils/alert';

class LoginForm extends Component {
  static propTypes = {
    parentFunction: PropTypes.func,
    authNav: PropTypes.func,
    location: PropTypes.object
  };

  constructor(props) {
    super(props);
    // this.validate = this.validate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      username: '',
      password: ''
    };
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    if (!this.state.username) {
      browserAlerts.alert('username requied');
      return;
    }
    if (!this.state.password) {
      browserAlerts.alert('password required');
      return;
    }
    this.props.parentFunction(this.state);
  }

  render() {
    const { username, password } = this.state;
    const local = username.length && password.length;
    return (
      <div className="innerForm">
        <input
          className="blueInput special"
          value={this.state.username}
          onChange={e => {
            this.setState({ username: e.target.value });
          }}
          type="text"
          name="username"
          placeholder="username or email"
        />
        <input
          className="blueInput special"
          value={this.state.password}
          onChange={e => {
            this.setState({ password: e.target.value });
          }}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              this.submit();
            }
          }}
          type="password"
          name="password"
          placeholder="password"
        />
        <a onClick={() => this.props.authNav('forgot')} className="subLink">
          Forgot Your Password?
        </a>
        <div style={{ width: '100%', visibility: !local ? 'visible' : 'hidden' }}>
          <span className={'or'}>or</span>
          <a
            className={'twitterButton'}
            href={`/auth/twitter?redirect=${this.props.location.pathname}`}
          >
            Sign in with Twitter
          </a>
        </div>

        <div style={{ width: '100%', visibility: local ? 'visible' : 'hidden' }}>
          <ShadowButton onClick={this.submit}>Sign In</ShadowButton>
        </div>

        <div className={'smallText'}>
          Not registered yet? <a onClick={() => this.props.authNav('signup')}>Sign up</a>
        </div>
      </div>
    );
  }
}

export default LoginForm;
