import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShadowButton from '../common/ShadowButton';

class LoginForm extends Component {
  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.object,
    checkUser: PropTypes.object,
    nameError: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      username: props.user.handle || ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    const { user, actions } = this.props;
    if (!this.state.username) {
      alert('username requied');
      return;
    }
    user.handle = this.state.username;
    actions.updateHandle(user);
  }

  render() {
    return (
      <div className="innerForm">
        <div className="authStatus">Choose your handle:</div>
        <div>
          <input
            className="blueInput special"
            type="text"
            placeholder="username"
            value={'@' + this.state.username}
            onChange={e => {
              const username = e.target.value.trim()
              .replace('@', '');
              this.props.checkUser(username.trim());
              this.handleChange('username', username);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.submit();
              }
            }}
          />
          {this.props.nameError ? (
            <div className={'error'}>{this.props.nameError}</div>
          ) : null}
        </div>

        <div style={{ width: '100%' }}>
          <ShadowButton onClick={this.submit}>Finish</ShadowButton>
        </div>
      </div>
    );
  }
}

export default LoginForm;
