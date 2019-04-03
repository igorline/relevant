import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import { View, Button } from 'modules/styled/uni';
import FormField from 'modules/styled/form/field.component';

class LoginForm extends Component {
  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.object,
    checkUser: PropTypes.func,
    nameError: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      username: props.user.handle || '',
      email: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(field, data) {
    this.setState({ [field]: data });
  }

  submit() {
    const { user, actions } = this.props;
    const updatedUser = { ...user };
    if (!this.state.username) {
      browserAlerts.alert('username requied');
      return;
    }
    updatedUser.handle = this.state.username;
    this.state.email ? (updatedUser.email = this.state.email) : null;
    actions.updateHandle(updatedUser);
  }

  render() {
    const { user } = this.props;
    return (
      <View>
        <FormField
          type="text"
          placeholder="Username"
          label="Choose your handle:"
          value={'@' + this.state.username}
          onChange={e => {
            const username = e.target.value.trim().replace('@', '');
            this.props.checkUser(username.trim());
            this.handleChange('username', username);
          }}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              this.submit();
            }
          }}
          error={this.props.nameError}
        />

        {user && !user.email ? (
          <FormField
            type="email"
            placeholder="email (optional for email reset and notifications)"
            label="Add your email:"
            onChange={e => {
              const email = e.target.value.trim();
              this.handleChange('email', email);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.submit();
              }
            }}
          />
        ) : null}

        <View justify="flex-start">
          <Button onClick={this.submit} ml="auto" mt={4}>
            Finish
          </Button>
        </View>
      </View>
    );
  }
}

export default LoginForm;
