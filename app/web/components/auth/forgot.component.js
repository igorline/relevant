import React, { Component } from 'react';
import ShadowButton from '../common/ShadowButton';

let styles;

export default class Forgot extends Component {
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
    let res = await this.props.actions.forgotPassword(this.state.username);
    if (res && res.email) {
      this.setState({ sentEmailTo: res.email });
    }
  }

  render() {
    let content;

    if (this.state.sentEmailTo) {
      content = `We have set an email to ${this.state.sentEmailTo}
      with a link to reset your password.`;
    } else {
      content = (
        <div>
          <input
            className="blueInput special"
            type="text"
            value={this.state.username}
            onChange={(username) => {
              this.handleChange('username', username.target.value);
            }}
            placeholder="Username or Email"
          />
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={() => this.sendEmail()}
          >
            Send Recovery Email
          </ShadowButton>
        </div>
      );
    }

    return (
      <div>
        <h2 style={{ textAlign: 'center' }}>Recover password</h2>
        {content}
      </div>
    );
  }
}
