import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, View, BodyText } from 'modules/styled/uni';
import { browserAlerts } from 'app/utils/alert';

export default class EmailConfirm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    auth: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      sending: false
    };
  }

  sendConfirmation() {
    this.setState({ sending: true });
    this.props.actions.sendConfirmation().then(success => {
      this.setState({ sending: false });
      if (success) {
        browserAlerts.alert('Confirmation email sent');
      }
    });
  }

  render() {
    let text = 'Your email has been confirmed';
    let resend;
    if (!this.props.auth.confirmed) {
      text = 'Oops... something went wrong';
      if (this.props.auth.user && !this.state.sending) {
        resend = (
          <View mt={2.5} justify="flex-end" fdirection="row">
            <Button onClick={() => this.sendConfirmation()}>
              Resend email confirmation code
            </Button>
          </View>
        );
      }
    }

    return (
      <View fdirection="column">
        <BodyText>{text}</BodyText>
        {resend}
      </View>
    );
  }
}
