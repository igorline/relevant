import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, LinkFont, View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import FormField from 'modules/styled/form/field.component';

// import ShadowButton from 'modules/ui/web/ShadowButton';

export default class Forgot extends Component {
  static propTypes = {
    actions: PropTypes.object,
    authNav: PropTypes.func
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
        <LinkFont c={colors.black}>
          We have set an email to {this.state.sentEmailTo} with a link to reset your
          password.
        </LinkFont>
      );
    } else {
      content = (
        <View>
          <FormField
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
          <Button onClick={() => this.sendEmail()} mt={6} ml="auto">
            Send Recovery Email
          </Button>
          <LinkFont mt={2}>
            Back to <a onClick={() => this.props.authNav('login')}>Sign in</a>
          </LinkFont>
        </View>
      );
    }

    return content;
  }
}
