import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShadowButton from '../common/ShadowButton';

class ResetPassword extends Component {
  static propTypes = {
    routeParams: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      password: '',
      cPassword: ''
    };
    this.submit = this.submit.bind(this);
    this.errors = {
      cPassword: null,
      password: null
    };
  }

  componentWillMount() {
    this.token = this.props.routeParams.token;
  }

  validate(newState) {
    if (newState.password && newState.cPassword) {
      if (newState.password !== newState.cPassword) {
        this.errors = { ...this.errors, cPassword: "Passwords don't match" };
      } else {
        this.errors = { ...this.errors, cPassword: false };
      }
    }
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  componentWillUpdate(newProps, newState) {
    if (newState !== this.state) {
      this.validate(newState);
    }
  }

  submit() {
    if (!this.state.password) {
      alert('password required');
      return;
    }
    if (!this.state.cPassword) {
      alert('please confirm password');
      return;
    }
    if (this.state.password !== this.state.cPassword) {
      alert("passwords don't match");
      return;
    }
    this.props.actions.resetPassword(this.state.password, this.token)
    .then(success => {
      if (success) this.props.actions.push('/user/login');
    });
  }

  render() {
    return (
      <div className="innerForm">
        <div>
          <input
            className="blueInput special"
            type="password"
            placeholder="Password"
            value={this.state.password}
            onChange={password => {
              this.handleChange('password', password.target.value);
            }}
          />
          {this.errors.password ? <div>{this.errors.password}</div> : null}
        </div>
        <div>
          <input
            className="blueInput special"
            type="password"
            placeholder="Confirm Password"
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
          {this.errors.cPassword ? <div>{this.errors.cPassword}</div> : null}
        </div>
        <br />
        <ShadowButton onClick={() => this.submit()}>Update Password</ShadowButton>
      </div>
    );
  }
}

export default ResetPassword;
