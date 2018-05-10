import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Link } from 'react-router';
import ShadowButton from '../common/ShadowButton';


class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.user.handle || '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    if (!this.state.username) {
      alert('username requied');
      return;
    }
    let user = this.props.user;
    user.handle = this.state.username;
    this.props.actions.updateHandle(user);
  }

  render() {
    let { username } = this.state;
    return (
      <div className="innerForm">
        <div className="authStatus">Choose your handle:</div>
        <div>
          <input
            className="blueInput special"
            type="text"
            placeholder="username"
            value={'@' + this.state.username}
            onChange={(e) => {
              let username = e.target.value.trim().replace('@', '');
              this.props.checkUser(username.trim());
              this.handleChange('username', username);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.submit();
              }
            }}
          />
          {this.props.nameError ? <div className={'error'}>{this.props.nameError}</div> : null}
        </div>

        <div style={{ width: '100%' }}>
          <ShadowButton
            onClick={this.submit}
          >
            Finish
          </ShadowButton>
        </div>
      </div>
    );
  }
}

export default LoginForm;
