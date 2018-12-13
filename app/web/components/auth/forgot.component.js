import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShadowButton from '../common/ShadowButton';

export default class Forgot extends Component {
  static propTypes = {
    actions: PropTypes.object,
    authNav: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      sentEmailTo: null
    };
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  async sendEmail() {
    const res = await this.props.actions.forgotPassword(this.state.username);
    if (res && res.email) {
      this.setState({ sentEmailTo: res.email });
    }
  }

  render() {
    let content;

    if (this.state.sentEmailTo) {
      content = (
        <div>
          We have set an email to {this.state.sentEmailTo}
          <br />
          with a link to reset your password.
        </div>
      );
    } else {
      content = (
        <div className="innerForm">
          <input
            className="blueInput special"
            type="text"
            value={this.state.username}
            onChange={username => {
              this.handleChange('username', username.target.value);
            }}
            placeholder="Username or Email"
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.sendEmail();
              }
            }}
          />
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={() => this.sendEmail()}
          >
            Send Recovery Email
          </ShadowButton>
          <div className={'smallText'}>
            Back to <a onClick={() => this.props.authNav('login')}>Sign in</a>
          </div>
        </div>
      );
    }

    return <div>{content}</div>;
  }
}
