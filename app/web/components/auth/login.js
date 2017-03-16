import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    // this.validate = this.validate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      username: '',
      password: '',
    };
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  componentWillUpdate(newProps, newState) {
    // if (newState !== this.state) {
    //   this.validate(newState);
    // }
  }

  submit() {
    if (!this.state.username) {
      alert('username requied');
      return;
    }
    if (!this.state.password) {
      alert('password required');
      return;
    }
    this.props.parentFunction(this.state);
  }

  render() {
    return (
      <div>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={this.state.username}
            onChange={(username) => {
              this.handleChange('username', username.target.value);
            }}
            placeholder="Username"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            value={this.state.password}
            onChange={(password) => {
              this.handleChange('password', password.target.value);
            }}
            type="password"
            placeholder="Password"
          />
        </div>
        <button onClick={() => this.submit()} type="submit">Log in</button>
        <br />
        {' '}
        or
        {' '}
        <Link to="/signup">Sign up</Link>
      </div>
    );
  }
}

// LoginForm = reduxForm({
//   form: 'login',
//   fields: ['username', 'password']
// })(LoginForm);

export default LoginForm;
