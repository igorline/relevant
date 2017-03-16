import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      username: '',
      email: '',
      password: '',
      cPassword: '',
    };
    this.submit = this.submit.bind(this);
    this.errors = {
      username: null,
      email: null,
      cPassword: null,
      password: null,
    };
  }

  validate(newState) {
    if (newState.email) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newState.email)) {
        this.errors = { ...this.errors, email: 'Invalid email address' };
      } else {
        this.errors = { ...this.errors, email: null };
      }
    }

    if (newState.username) {
      if (newState.username.length > 15) {
        this.errors = { ...this.errors, username: 'Must be 15 characters or less' };
      } else {
        this.errors = { ...this.errors, username: null };
      }
    }

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
3
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

  render() {
    return (
      <div>
        <div>
          <label>Email</label>
          <input
            type="text"
            value={this.state.email}
            onChange={(email) => {
              this.handleChange('email', email.target.value);
            }}
            placeholder="Email"
          />
          {this.errors.email ? <div>{this.errors.email}</div> : null}
        </div>
        <div>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            value={this.state.username}
            onChange={(username) => {
              this.handleChange('username', username.target.value);
            }}
          />
          {this.errors.username ? <div>{this.errors.username}</div> : null}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={this.state.password}
            onChange={(password) => {
              this.handleChange('password', password.target.value);
            }}
          />
          {this.errors.password ? <div>{this.errors.password}</div> : null}
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={this.state.cPassword}
            onChange={(cPassword) => {
              this.handleChange('cPassword', cPassword.target.value);
            }}
          />
          {this.errors.cPassword ? <div>{this.errors.cPassword}</div> : null}
        </div>
        <button type="submit" onClick={() => this.submit()}>Sign up</button>
        {' '}
        or
        {' '}
        <Link to="/login">Log in</Link>
      </div>
    );
  }
}

// SignupForm = reduxForm({
//   form: 'login',
//   fields: ['email', 'username', 'password', 'confirmPassword'],
//   validate
// })(SignupForm);

export default SignupForm;