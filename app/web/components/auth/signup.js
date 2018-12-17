import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ShadowButton from '../common/ShadowButton';
import { NAME_PATTERN } from '../../../utils/text';
import SetHandle from './handle.component';

class SignupForm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    parentFunction: PropTypes.func,
    user: PropTypes.object,
    authNav: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      cPassword: '',
      errors: {},
      provider: 'twitter'
    };

    this.errors = {
      username: null,
      email: null,
      cPassword: null,
      password: null
    };

    this.checkUser = this.checkUser.bind(this);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderEmailForm = this.renderEmailForm.bind(this);
  }

  checkEmail() {
    const string = this.state.email;
    if (!string.length) return null;
    const valid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(string);
    if (!valid) return this.setState({ errors: { email: 'invalid email' } });

    return this.props.actions.checkUser(string, 'email')
    .then(results => {
      if (!results) {
        return this.setState({ errors: { email: 'This email has already been used' } });
      }
      return null;
    });
  }

  checkUser(name) {
    this.nameError = null;
    const toCheck = name || this.state.name;
    if (toCheck) {
      const string = toCheck;
      const match = NAME_PATTERN.test(string);
      if (match) {
        this.props.actions.checkUser(string, 'name')
        .then(results => {
          if (!results) {
            this.usernameExists = true;
            this.nameError = 'This username is already taken';
          } else this.usernameExists = false;
          this.setState({});
        });
      } else {
        this.nameError =
          'username can only contain letters, \nnumbers, dashes and underscores';
        console.log(this.nameError);
        this.setState({});
      }
    }
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  componentWillUpdate(newProps, newState) {
    if (newState !== this.state) {
      // this.validate(newState);
    }
  }

  submit() {
    if (!this.state.email) {
      alert('email required');
      return;
    }
    if (!this.state.username) {
      alert('username requied');
      return;
    }
    if (!this.state.password) {
      alert('password required');
      return;
    }
    if (!this.state.cPassword) {
      alert('confirm password');
      return;
    }
    if (this.state.password !== this.state.cPassword) {
      alert("passwords don't match");
      return;
    }
    this.props.parentFunction(this.state);
  }

  renderEmailForm() {
    const { errors } = this.state;
    const signUpWithEmail = (
      <a
        className={'smallText middle'}
        onClick={() => this.setState({ provider: 'email' })}
      >
        Sign up with Email
      </a>
    );

    if (this.state.provider !== 'email') return signUpWithEmail;

    return (
      <div>
        <div>
          <input
            className="blueInput special"
            type="text"
            placeholder="username"
            value={this.state.username}
            onChange={e => {
              const username = e.target.value.trim();
              this.checkUser(username.trim());
              this.handleChange('username', username);
            }}
          />
          {this.nameError ? <div className={'error'}>{this.nameError}</div> : null}
        </div>

        <div>
          <input
            className="blueInput special"
            type="text"
            value={this.state.email}
            onChange={email => {
              this.handleChange('email', email.target.value);
            }}
            onBlur={this.checkEmail.bind(this)}
            onFocus={() => this.setState({ errors: { email: null } })}
            placeholder="email"
          />
          {errors.email ? <div className={'error'}>{errors.email}</div> : null}
        </div>

        <div>
          <input
            className="blueInput special"
            type="password"
            placeholder="password"
            value={this.state.password}
            onChange={password => {
              this.handleChange('password', password.target.value);
            }}
          />
          {this.errors.password ? (
            <div className={'error'}>{this.errors.password}</div>
          ) : null}
        </div>
        <div>
          <input
            className="blueInput special"
            type="password"
            placeholder="confirm password"
            value={this.state.cPassword}
            onChange={cPassword => {
              this.handleChange('cPassword', cPassword.target.value);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.submit();
              }
            }}
          />
          {this.errors.cPassword ? (
            <div className={'error'}>{this.errors.cPassword}</div>
          ) : null}
        </div>

        <div style={{ width: '100%' }}>
          <ShadowButton onClick={this.submit}>Sign Up</ShadowButton>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.user && this.props.user.role === 'temp') {
      return (
        <SetHandle
          checkUser={this.checkUser}
          nameError={this.nameError}
          user={this.props.user}
          {...this.props}
        />
      );
    }

    return (
      <div className="innerForm">
        <div style={{ width: '100%' }}>
          <a className={'twitterButton'} href="/auth/twitter">
            Sign up with Twitter
          </a>
          <span className={'or'}>or</span>
        </div>

        {this.renderEmailForm()}

        <div className={'smallText'}>
          Already registered?{' '}
          <Link onClick={() => this.props.authNav('login')}>Sign in</Link>
        </div>
      </div>
    );
  }
}

export default SignupForm;
