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
      browserAlerts.alert('username requied');
      return;
    }
    user.handle = this.state.username;
    actions.updateHandle(user);
  }

  render() {
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
